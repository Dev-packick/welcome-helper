const pool = require('../db/pool');

// GET — Statistiques globales
const getStats = async (req, res) => {
    try {
        const [
        usersResult,
        missionsResult,
        pointsResult,
        revenusResult
        ] = await Promise.all([
        pool.query(`
            SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE role = 'etranger') AS etrangers,
            COUNT(*) FILTER (WHERE role = 'resident') AS residents,
            COUNT(*) FILTER (WHERE role = 'admin') AS admins,
            COUNT(*) FILTER (WHERE is_certifie = true) AS certifies
            FROM "user"
        `),
        pool.query(`
            SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE statut = 'ouverte') AS ouvertes,
            COUNT(*) FILTER (WHERE statut = 'en_cours') AS en_cours,
            COUNT(*) FILTER (WHERE statut = 'terminee') AS terminees,
            COUNT(*) FILTER (WHERE statut = 'annulee') AS annulees
            FROM mission
        `),
        pool.query(`
            SELECT COALESCE(SUM(valeur), 0) AS total_points
            FROM point WHERE valeur > 0
        `),
        pool.query(`
            SELECT COALESCE(SUM(prix), 0) AS total_revenus
            FROM abonnement WHERE statut_paiement = 'paye'
        `)
        ]);

        res.status(200).json({
        users: usersResult.rows[0],
        missions: missionsResult.rows[0],
        points_distribues: pointsResult.rows[0].total_points,
        revenus: revenusResult.rows[0].total_revenus
        });

    } catch (error) {
        console.error('Erreur getStats:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // GET — Liste des utilisateurs
    const getUsers = async (req, res) => {
    const { role, page = 1 } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
        let query = `
        SELECT 
            etudiant.user_id, etudiant.nom, etudiant.prenom,
            etudiant.email, etudiant.role, etudiant.is_certifie,
            etudiant.solde_points, etudiant.created_at,
            profil.pays_origine, profil.universite, profil.avatar_url,
            (SELECT COUNT(*) FROM mission WHERE id_publiant = etudiant.user_id) AS missions_publiees,
            (SELECT COUNT(*) FROM mission WHERE id_realisant = etudiant.user_id) AS missions_realisees
        FROM "user" AS etudiant
        LEFT JOIN profil ON profil.id_user = etudiant.user_id
        WHERE etudiant.role != 'admin'
        `;

        const params = [];
        let paramCount = 1;

        if (role) {
        query += ` AND etudiant.role = $${paramCount}`;
        params.push(role);
        paramCount++;
        }

        query += ` ORDER BY etudiant.created_at DESC`;
        query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        res.status(200).json({ users: result.rows });

    } catch (error) {
        console.error('Erreur getUsers:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // PUT — Certifier un utilisateur
    const certifierUser = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(
        `UPDATE "user" SET is_certifie = true WHERE user_id = $1`,
        [id]
        );
        res.status(200).json({ message: 'Utilisateur certifié avec succès' });
    } catch (error) {
        console.error('Erreur certifierUser:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // DELETE — Supprimer un utilisateur
    const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(
        `DELETE FROM "user" WHERE user_id = $1 AND role != 'admin'`,
        [id]
        );
        res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error('Erreur deleteUser:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // GET — Liste des missions (admin)
    const getMissionsAdmin = async (req, res) => {
    const { statut, page = 1 } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
        let query = `
        SELECT 
            mission.*,
            etudiant.nom, etudiant.prenom, etudiant.email
        FROM mission
        JOIN "user" AS etudiant ON etudiant.user_id = mission.id_publiant
        WHERE 1=1
        `;

        const params = [];
        let paramCount = 1;

        if (statut) {
        query += ` AND mission.statut = $${paramCount}`;
        params.push(statut);
        paramCount++;
        }

        query += ` ORDER BY mission.date_publication DESC`;
        query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        res.status(200).json({ missions: result.rows });

    } catch (error) {
        console.error('Erreur getMissionsAdmin:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // DELETE — Supprimer une mission (admin)
    const deleteMissionAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM mission WHERE id_mission = $1', [id]);
        res.status(200).json({ message: 'Mission supprimée' });
    } catch (error) {
        console.error('Erreur deleteMissionAdmin:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // GET — Liste des partenaires
    const getPartenaires = async (req, res) => {
    try {
        const result = await pool.query(
        `SELECT partenaire.*,
            COUNT(recompense.id_recomp) AS nb_recompenses
        FROM partenaire
        LEFT JOIN recompense ON recompense.id_partenaire = partenaire.id_partenaire
        GROUP BY partenaire.id_partenaire
        ORDER BY partenaire.nom_enseigne ASC`
        );
        res.status(200).json({ partenaires: result.rows });
    } catch (error) {
        console.error('Erreur getPartenaires:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // POST — Créer un partenaire
    const createPartenaire = async (req, res) => {
    const { nom_enseigne, logo_url, contact } = req.body;
    if (!nom_enseigne) {
        return res.status(400).json({ message: 'Le nom est obligatoire' });
    }
    try {
        const result = await pool.query(
        `INSERT INTO partenaire (nom_enseigne, logo_url, contact)
        VALUES ($1, $2, $3) RETURNING *`,
        [nom_enseigne, logo_url, contact]
        );
        res.status(201).json({
        message: 'Partenaire créé avec succès',
        partenaire: result.rows[0]
        });
    } catch (error) {
        console.error('Erreur createPartenaire:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // PUT — Modifier un partenaire
    const updatePartenaire = async (req, res) => {
    const { id } = req.params;
    const { nom_enseigne, logo_url, contact } = req.body;
    try {
        const result = await pool.query(
        `UPDATE partenaire
        SET nom_enseigne=$1, logo_url=$2, contact=$3
        WHERE id_partenaire=$4 RETURNING *`,
        [nom_enseigne, logo_url, contact, id]
        );
        if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Partenaire non trouvé' });
        }
        res.status(200).json({
        message: 'Partenaire mis à jour',
        partenaire: result.rows[0]
        });
    } catch (error) {
        console.error('Erreur updatePartenaire:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // DELETE — Supprimer un partenaire
    const deletePartenaire = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM partenaire WHERE id_partenaire = $1', [id]);
        res.status(200).json({ message: 'Partenaire supprimé' });
    } catch (error) {
        console.error('Erreur deletePartenaire:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // GET — Récompenses d'un partenaire
    const getRecompensesPartenaire = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
        `SELECT * FROM recompense 
        WHERE id_partenaire = $1 
        ORDER BY cout_en_points ASC`,
        [id]
        );
        res.status(200).json({ recompenses: result.rows });
    } catch (error) {
        console.error('Erreur getRecompensesPartenaire:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // POST — Créer une récompense
    const createRecompense = async (req, res) => {
    const { id } = req.params;
    const { nom_recomp, desc_recomp, cout_en_points, stock_disponible, cat_partenaire, image_url } = req.body;

    if (!nom_recomp || !cout_en_points) {
        return res.status(400).json({ message: 'Nom et coût sont obligatoires' });
    }

    try {
        const result = await pool.query(
        `INSERT INTO recompense 
            (id_partenaire, nom_recomp, desc_recomp, cout_en_points, stock_disponible, cat_partenaire, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [id, nom_recomp, desc_recomp, cout_en_points, stock_disponible || 0, cat_partenaire, image_url || null]
        );
        res.status(201).json({
        message: 'Récompense créée',
        recompense: result.rows[0]
        });
    } catch (error) {
        console.error('Erreur createRecompense:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // PUT — Modifier une récompense
    const updateRecompense = async (req, res) => {
    const { id } = req.params;
    const { nom_recomp, desc_recomp, cout_en_points, stock_disponible, cat_partenaire, image_url } = req.body;

    try {
        const result = await pool.query(
        `UPDATE recompense
        SET nom_recomp=$1, desc_recomp=$2, cout_en_points=$3,
            stock_disponible=$4, cat_partenaire=$5, image_url=$6
        WHERE id_recomp=$7 RETURNING *`,
        [nom_recomp, desc_recomp, cout_en_points, stock_disponible, cat_partenaire, image_url || null, id]
        );
        if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Récompense non trouvée' });
        }
        res.status(200).json({
        message: 'Récompense mise à jour',
        recompense: result.rows[0]
        });
    } catch (error) {
        console.error('Erreur updateRecompense:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // DELETE — Supprimer une récompense
    const deleteRecompense = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM recompense WHERE id_recomp = $1', [id]);
        res.status(200).json({ message: 'Récompense supprimée' });
    } catch (error) {
        console.error('Erreur deleteRecompense:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    module.exports = {
    getStats,
    getUsers,
    certifierUser,
    deleteUser,
    getMissionsAdmin,
    deleteMissionAdmin,
    getPartenaires,
    createPartenaire,
    updatePartenaire,
    deletePartenaire,
    getRecompensesPartenaire,
    createRecompense,
    updateRecompense,
    deleteRecompense
};

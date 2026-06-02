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

    module.exports = {
    getStats,
    getUsers,
    certifierUser,
    deleteUser,
    getMissionsAdmin,
    deleteMissionAdmin
};

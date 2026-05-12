const pool = require('../db/pool');
const { validationResult } = require('express-validator');

// POST — Créer une mission
const createMission = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { titre, desc_mission, cat_mission, points_offerts, date_echeance } = req.body;
    const id_publiant = req.user.user_id;

    try {
        const result = await pool.query(
        `INSERT INTO mission
            (id_publiant, titre, desc_mission, cat_mission, points_offerts, date_echeance)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [id_publiant, titre, desc_mission, cat_mission, points_offerts, date_echeance]
        );

        res.status(201).json({
        message: 'Mission créée avec succès',
        mission: result.rows[0]
        });

    } catch (error) {
        console.error('Erreur createMission:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // GET — Liste des missions avec filtres
    const getMissions = async (req, res) => {
    const { cat_mission, statut, page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
        let query = `
        SELECT
            mission.*,
            etudiant.nom, etudiant.prenom, etudiant.is_certifie,
            profil.avatar_url, profil.pays_origine,
            (SELECT ROUND(AVG(note), 1) FROM evaluation
            WHERE id_evaluer = mission.id_publiant) AS note_moyenne
        FROM mission
        JOIN "user" AS etudiant ON etudiant.user_id = mission.id_publiant
        LEFT JOIN profil ON profil.id_user = mission.id_publiant
        WHERE 1=1
        `;

        const params = [];
        let paramCount = 1;

        if (cat_mission) {
        query += ` AND mission.cat_mission = $${paramCount}`;
        params.push(cat_mission);
        paramCount++;
        }

        if (statut) {
        query += ` AND mission.statut = $${paramCount}`;
        params.push(statut);
        paramCount++;
        }

        query += ` ORDER BY mission.date_publication DESC`;
        query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.status(200).json({
        missions: result.rows,
        page: parseInt(page),
        total: result.rows.length
        });

    } catch (error) {
        console.error('Erreur getMissions:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // GET — Détail d'une mission
    const getMissionById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
        `SELECT
            mission.*,
            etudiant.nom, etudiant.prenom, etudiant.is_certifie,
            profil.avatar_url, profil.pays_origine, profil.universite
        FROM mission
        JOIN "user" AS etudiant ON etudiant.user_id = mission.id_publiant
        LEFT JOIN profil ON profil.id_user = mission.id_publiant
        WHERE mission.id_mission = $1`,
        [id]
        );

        if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Mission non trouvée' });
        }

        res.status(200).json({ mission: result.rows[0] });

    } catch (error) {
        console.error('Erreur getMissionById:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // PUT — Modifier une mission
    const updateMission = async (req, res) => {
    const { id } = req.params;
    const { titre, desc_mission, cat_mission, points_offerts, date_echeance } = req.body;

    try {
        // Vérifier que la mission appartient à l'utilisateur
        const check = await pool.query(
        'SELECT * FROM mission WHERE id_mission = $1',
        [id]
        );

        if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Mission non trouvée' });
        }

        const mission = check.rows[0];

        if (mission.id_publiant !== req.user.user_id) {
        return res.status(403).json({ message: 'Accès refusé' });
        }

        if (mission.statut !== 'ouverte') {
        return res.status(400).json({
            message: 'Impossible de modifier une mission déjà en cours ou terminée'
        });
        }

        const result = await pool.query(
        `UPDATE mission
        SET titre=$1, desc_mission=$2, cat_mission=$3,
            points_offerts=$4, date_echeance=$5
        WHERE id_mission=$6
        RETURNING *`,
        [titre, desc_mission, cat_mission, points_offerts, date_echeance, id]
        );

        res.status(200).json({
        message: 'Mission mise à jour',
        mission: result.rows[0]
        });

    } catch (error) {
        console.error('Erreur updateMission:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    // DELETE — Supprimer une mission
    const deleteMission = async (req, res) => {
    const { id } = req.params;

    try {
        const check = await pool.query(
        'SELECT * FROM mission WHERE id_mission = $1',
        [id]
        );

        if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Mission non trouvée' });
        }

        const mission = check.rows[0];

        if (mission.id_publiant !== req.user.user_id) {
        return res.status(403).json({ message: 'Accès refusé' });
        }

        if (mission.statut !== 'ouverte') {
        return res.status(400).json({
            message: 'Impossible de supprimer une mission déjà en cours ou terminée'
        });
        }

        await pool.query('DELETE FROM mission WHERE id_mission = $1', [id]);

        res.status(200).json({ message: 'Mission supprimée avec succès' });

    } catch (error) {
        console.error('Erreur deleteMission:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    };

    module.exports = {
    createMission,
    getMissions,
    getMissionById,
    updateMission,
    deleteMission
};

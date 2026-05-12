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


    // POST — Accepter une mission
    const accepterMission = async (req, res) => {
    const { id } = req.params;
    const id_realisant = req.user.user_id;

        try {
            // Vérifier que la mission existe et est ouverte
            const check = await pool.query(
            'SELECT * FROM mission WHERE id_mission = $1',
            [id]
            );

            if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Mission non trouvée' });
            }

            const mission = check.rows[0];

            // Vérifier que la mission est ouverte
            if (mission.statut !== 'ouverte') {
            return res.status(400).json({
                message: 'Cette mission n\'est plus disponible'
            });
            }

            // Vérifier que ce n'est pas l'auteur qui accepte sa propre mission
            if (mission.id_publiant === id_realisant) {
            return res.status(400).json({
                message: 'Vous ne pouvez pas accepter votre propre mission'
            });
            }

            // Transaction SQL — les deux opérations doivent réussir ensemble
            await pool.query('BEGIN');

            // 1 — Mettre à jour la mission
            await pool.query(
            `UPDATE mission 
            SET statut = 'en_cours', id_realisant = $1
            WHERE id_mission = $2`,
            [id_realisant, id]
            );

            // 2 — Créer la conversation automatiquement
            const conv = await pool.query(
            `INSERT INTO conversation (id_mission, id_user1, id_user2)
            VALUES ($1, $2, $3)
            RETURNING id_conversation`,
            [id, mission.id_publiant, id_realisant]
            );

            await pool.query('COMMIT');

            res.status(200).json({
            message: 'Mission acceptée avec succès',
            id_conversation: conv.rows[0].id_conversation,
            mission_statut: 'en_cours'
            });

        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Erreur accepterMission:', error.message);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    };


    // POST — Terminer une mission
    const terminerMission = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.user_id;

        try {
            // Vérifier que la mission existe
            const check = await pool.query(
            'SELECT * FROM mission WHERE id_mission = $1',
            [id]
            );

            if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Mission non trouvée' });
            }

            const mission = check.rows[0];

            // Vérifier que c'est bien le publiant qui termine
            if (mission.id_publiant !== user_id) {
            return res.status(403).json({
                message: 'Seul le créateur de la mission peut la terminer'
            });
            }

            // Vérifier que la mission est en cours
            if (mission.statut !== 'en_cours') {
            return res.status(400).json({
                message: 'La mission doit être en cours pour être terminée'
            });
            }

            // Transaction SQL
            await pool.query('BEGIN');

            // 1 — Mettre à jour le statut de la mission
            await pool.query(
            `UPDATE mission SET statut = 'terminee' WHERE id_mission = $1`,
            [id]
            );

            // 2 — Créer une entrée dans la table point
            const pointResult = await pool.query(
            `INSERT INTO point (id_user, valeur, motif)
            VALUES ($1, $2, $3)
            RETURNING id_point`,
            [
                mission.id_realisant,
                mission.points_offerts,
                `Mission terminée : ${mission.titre}`
            ]
            );

            // 3 — Mettre à jour le solde du résident
            await pool.query(
            `UPDATE "user" 
            SET solde_points = solde_points + $1
            WHERE user_id = $2`,
            [mission.points_offerts, mission.id_realisant]
            );

            await pool.query('COMMIT');

            res.status(200).json({
            message: 'Mission terminée avec succès',
            points_credites: mission.points_offerts,
            mission_statut: 'terminee'
            });

        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Erreur terminerMission:', error.message);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    };

    module.exports = {
    createMission,
    getMissions,
    getMissionById,
    updateMission,
    deleteMission,
    accepterMission,
    terminerMission
};

const pool = require('../db/pool');
const { validationResult } = require('express-validator');


// POST - Créer une évaluation
const createEvaluation = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id_mission, note, commentaire } = req.body;
    const id_evaluateur = req.user.user_id;

        try {
            const missionCheck = await pool.query(
            'SELECT * FROM mission WHERE id_mission = $1',
            [id_mission]
            );

            if (missionCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Mission non trouvée' });
            }

            const mission = missionCheck.rows[0];

            if (mission.statut !== 'terminee') {
            return res.status(400).json({
                message: 'Vous ne pouvez évaluer qu\'une mission terminée'
            });
            }

            if (mission.id_publiant !== id_evaluateur) {
            return res.status(403).json({
                message: 'Seul le créateur de la mission peut évaluer'
            });
            }

            const evalCheck = await pool.query(
            'SELECT * FROM evaluation WHERE id_mission = $1',
            [id_mission]
            );

            if (evalCheck.rows.length > 0) {
            return res.status(400).json({
                message: 'Vous avez déjà évalué cette mission'
            });
            }

            const result = await pool.query(
            `INSERT INTO evaluation
                (id_mission, id_evaluateur, id_evaluer, note, commentaire)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [id_mission, id_evaluateur, mission.id_realisant, note, commentaire]
            );

            res.status(201).json({
            message: 'Évaluation enregistrée avec succès',
            evaluation: result.rows[0]
            });

        } catch (error) {
            console.error('Erreur createEvaluation:', error.message);
            res.status(500).json({ message: 'Erreur serveur' });
        }
};


// GET - Évaluations reçues par un utilisateur
const getEvaluations = async (req, res) => {
    const { id } = req.params;

        try {
            const result = await pool.query(
            `SELECT
                evaluation.*,
                etudiant.nom AS evaluateur_nom,
                etudiant.prenom AS evaluateur_prenom,
                mission.titre AS mission_titre
            FROM evaluation
            JOIN "user" AS etudiant ON etudiant.user_id = evaluation.id_evaluateur
            JOIN mission ON mission.id_mission = evaluation.id_mission
            WHERE evaluation.id_evaluer = $1
            ORDER BY evaluation.date_evaluation DESC`,
            [id]
            );

            const moyenne = result.rows.length > 0
            ? (result.rows.reduce((sum, e) => sum + e.note, 0) / result.rows.length).toFixed(1)
            : null;

            res.status(200).json({
            evaluations: result.rows,
            moyenne,
            total: result.rows.length
            });

        } catch (error) {
            console.error('Erreur getEvaluations:', error.message);
            res.status(500).json({ message: 'Erreur serveur' });
        }
};

module.exports = { createEvaluation, getEvaluations };

const pool = require('../db/pool');
const { debitPoints } = require('../utils/pointsService');


// GET - Liste des récompenses
const getRecompenses = async (req, res) => {
    const { cat_partenaire } = req.query;
    try {
        let query = `
        SELECT
            recompense.*,
            partenaire.nom_enseigne,
            partenaire.logo_url AS partenaire_logo,
            partenaire.contact
        FROM recompense
        JOIN partenaire ON partenaire.id_partenaire = recompense.id_partenaire
        WHERE recompense.stock_disponible > 0
        `;

        const params = [];

        if (cat_partenaire) {
        query += ` AND recompense.cat_partenaire = $1`;
        params.push(cat_partenaire);
        }

        query += ` ORDER BY recompense.cout_en_points ASC`;
        const result = await pool.query(query, params);
        res.status(200).json({ recompenses: result.rows });

    } catch (error) {
        console.error('Erreur getRecompenses:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};


// GET - Détail d'une récompense
const getRecompenseById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
        `SELECT
            recompense.*,
            partenaire.nom_enseigne,
            partenaire.logo_url AS partenaire_logo,
            partenaire.contact
        FROM recompense
        JOIN partenaire ON partenaire.id_partenaire = recompense.id_partenaire
        WHERE recompense.id_recomp = $1`,
        [id]
        );

        if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Récompense non trouvée' });
        }

        res.status(200).json({ recompense: result.rows[0] });

    } catch (error) {
        console.error('Erreur getRecompenseById:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};


// POST - Échanger des points contre une récompense
const echangerRecompense = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.user_id;
    try {
        const recompCheck = await pool.query(
        'SELECT * FROM recompense WHERE id_recomp = $1',
        [id]
        );

        if (recompCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Récompense non trouvée' });
        }

    const recompense = recompCheck.rows[0];

    if (recompense.stock_disponible <= 0) {
        return res.status(400).json({ message: 'Stock épuisé' });
        }

        await pool.query('BEGIN');

        try {
        await debitPoints(
            user_id,
            recompense.cout_en_points,
            `Échange récompense : ${recompense.nom_recomp}`
        );

        await pool.query(
            `UPDATE recompense
            SET stock_disponible = stock_disponible - 1
            WHERE id_recomp = $1`,
            [id]
        );

        await pool.query(
            `INSERT INTO echanger (id_user, id_recomp, date_echange)
            VALUES ($1, $2, NOW())`,
            [user_id, id]
        );

        await pool.query('COMMIT');

        res.status(200).json({
            message: 'Échange effectué avec succès',
            recompense: recompense.nom_recomp,
            points_debites: recompense.cout_en_points
        });

        } catch (innerError) {
        await pool.query('ROLLBACK');
        if (innerError.message === 'Solde insuffisant') {
            return res.status(400).json({ message: 'Solde insuffisant' });
        }
        throw innerError;
        }

    } catch (error) {
        console.error('Erreur echangerRecompense:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { getRecompenses, getRecompenseById, echangerRecompense };

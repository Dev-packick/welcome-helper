const pool = require('../db/pool');

// GET — Liste des récompenses
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

    // GET — Détail d'une récompense
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

module.exports = { getRecompenses, getRecompenseById };

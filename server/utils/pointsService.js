const pool = require('../db/pool');

// Créditer des points à un utilisateur
const creditPoints = async (userId, valeur, motif) => {
    await pool.query('BEGIN');
    try {
        // Insérer la transaction
        const pointResult = await pool.query(
        `INSERT INTO point (id_user, valeur, motif)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [userId, valeur, motif]
        );

        // Mettre à jour le solde
        const userResult = await pool.query(
        `UPDATE "user"
        SET solde_points = solde_points + $1
        WHERE user_id = $2
        RETURNING solde_points`,
        [valeur, userId]
        );

        await pool.query('COMMIT');

        return {
        point: pointResult.rows[0],
        nouveau_solde: userResult.rows[0].solde_points
        };
    } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
    }
    };

    // Débiter des points d'un utilisateur
    const debitPoints = async (userId, valeur, motif) => {
    await pool.query('BEGIN');
    try {
        // Vérifier le solde
        const check = await pool.query(
        'SELECT solde_points FROM "user" WHERE user_id = $1',
        [userId]
        );

        if (check.rows[0].solde_points < valeur) {
        throw new Error('Solde insuffisant');
        }

        // Insérer la transaction (valeur négative)
        const pointResult = await pool.query(
        `INSERT INTO point (id_user, valeur, motif)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [userId, -valeur, motif]
        );

        // Mettre à jour le solde
        const userResult = await pool.query(
        `UPDATE "user"
        SET solde_points = solde_points - $1
        WHERE user_id = $2
        RETURNING solde_points`,
        [valeur, userId]
        );

        await pool.query('COMMIT');

        return {
        point: pointResult.rows[0],
        nouveau_solde: userResult.rows[0].solde_points
        };
    } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
    }
    };

    // Historique des transactions d'un utilisateur
    const getHistorique = async (userId) => {
    const result = await pool.query(
        `SELECT * FROM point
        WHERE id_user = $1
        ORDER BY date_transaction DESC`,
        [userId]
    );
    return result.rows;
    };

    // Solde actuel d'un utilisateur
    const getSolde = async (userId) => {
    const result = await pool.query(
        'SELECT solde_points FROM "user" WHERE user_id = $1',
        [userId]
    );
    return result.rows[0]?.solde_points || 0;
};

module.exports = { creditPoints, debitPoints, getHistorique, getSolde };

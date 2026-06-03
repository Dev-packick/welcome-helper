const pool = require('../db/pool');

const getDashboard = async (req, res) => {
    const user_id = req.user.user_id;
    const role = req.user.role;

    try {
        // Infos utilisateur
        const userResult = await pool.query(
        `SELECT 
            etudiant.user_id, etudiant.nom, etudiant.prenom,
            etudiant.solde_points, etudiant.created_at, etudiant.role,
            profil.avatar_url, profil.pays_origine
        FROM "user" AS etudiant
        LEFT JOIN profil ON profil.id_user = etudiant.user_id
        WHERE etudiant.user_id = $1`,
        [user_id]
        );

        const user = userResult.rows[0];

        // Jours depuis l'arrivée
        const joursEnFrance = Math.floor(
        (new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)
        );

        // Missions selon le rôle
        let missionsQuery;
        if (role === 'etranger') {
        missionsQuery = await pool.query(
            `SELECT mission.*, 
            etudiant.nom AS realisant_nom,
            etudiant.prenom AS realisant_prenom
            FROM mission
            LEFT JOIN "user" AS etudiant ON etudiant.user_id = mission.id_realisant
            WHERE mission.id_publiant = $1
            ORDER BY mission.date_publication DESC
            LIMIT 5`,
            [user_id]
        );
        } else {
        missionsQuery = await pool.query(
            `SELECT mission.*,
            etudiant.nom AS publiant_nom,
            etudiant.prenom AS publiant_prenom
            FROM mission
            LEFT JOIN "user" AS etudiant ON etudiant.user_id = mission.id_publiant
            WHERE mission.id_realisant = $1
            ORDER BY mission.date_publication DESC
            LIMIT 5`,
            [user_id]
        );
        }

        // Stats
        const [missionsCount, pointsResult, messagesResult] = await Promise.all([
        pool.query(
            role === 'etranger'
            ? `SELECT COUNT(*) FILTER (WHERE statut = 'terminee') AS terminees
                FROM mission WHERE id_publiant = $1`
            : `SELECT COUNT(*) FILTER (WHERE statut = 'terminee') AS terminees
                FROM mission WHERE id_realisant = $1`,
            [user_id]
        ),
        pool.query(
            `SELECT solde_points FROM "user" WHERE user_id = $1`,
            [user_id]
        ),
        pool.query(
            `SELECT
            conv.id_conversation,
            CASE WHEN conv.id_user1 = $1
                THEN etudiant2.prenom
                ELSE etudiant1.prenom
            END AS autre_prenom,
            CASE WHEN conv.id_user1 = $1
                THEN etudiant2.nom
                ELSE etudiant1.nom
            END AS autre_nom,
            (SELECT content FROM message
            WHERE id_conversation = conv.id_conversation
            ORDER BY date_envoi DESC LIMIT 1) AS dernier_message,
            (SELECT date_envoi FROM message
            WHERE id_conversation = conv.id_conversation
            ORDER BY date_envoi DESC LIMIT 1) AS date_dernier_message,
            (SELECT COUNT(*) FROM message
            WHERE id_conversation = conv.id_conversation
            AND id_expediteur != $1
            AND is_read = false) AS non_lus
            FROM conversation AS conv
            JOIN "user" AS etudiant1 ON etudiant1.user_id = conv.id_user1
            JOIN "user" AS etudiant2 ON etudiant2.user_id = conv.id_user2
            WHERE conv.id_user1 = $1 OR conv.id_user2 = $1
            ORDER BY date_dernier_message DESC NULLS LAST
            LIMIT 3`,
            [user_id]
        )
        ]);

        res.status(200).json({
        user: {
            ...user,
            jours_en_france: joursEnFrance,
            solde_points: pointsResult.rows[0].solde_points
        },
        missions: missionsQuery.rows,
        stats: {
            missions_terminees: missionsCount.rows[0].terminees,
            solde_points: pointsResult.rows[0].solde_points
        },
        messages_recents: messagesResult.rows
        });

    } catch (error) {
        console.error('Erreur getDashboard:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { getDashboard };

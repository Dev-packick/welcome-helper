const pool = require('../db/pool');

// GET — Liste des conversations de l'utilisateur connecté
const getConversations = async (req, res) => {
    const user_id = req.user.user_id;

        try {
            const result = await pool.query(
            `SELECT
                conv.id_conversation,
                conv.statut,
                conv.date_creation,
                mission.titre AS mission_titre,
                -- Infos de l'autre utilisateur
                CASE
                WHEN conv.id_user1 = $1 THEN etudiant2.nom
                ELSE etudiant1.nom
                END AS autre_nom,
                CASE
                WHEN conv.id_user1 = $1 THEN etudiant2.prenom
                ELSE etudiant1.prenom
                END AS autre_prenom,
                CASE
                WHEN conv.id_user1 = $1 THEN profil2.avatar_url
                ELSE profil1.avatar_url
                END AS autre_avatar,
                CASE
                WHEN conv.id_user1 = $1 THEN conv.id_user2
                ELSE conv.id_user1
                END AS autre_user_id,
                -- Dernier message
                (SELECT content FROM message
                WHERE id_conversation = conv.id_conversation
                ORDER BY date_envoi DESC LIMIT 1) AS dernier_message,
                (SELECT date_envoi FROM message
                WHERE id_conversation = conv.id_conversation
                ORDER BY date_envoi DESC LIMIT 1) AS date_dernier_message,
                -- Nombre de messages non lus
                (SELECT COUNT(*) FROM message
                WHERE id_conversation = conv.id_conversation
                AND id_expediteur != $1
                AND is_read = false) AS non_lus
            FROM conversation AS conv
            JOIN "user" AS etudiant1 ON etudiant1.user_id = conv.id_user1
            JOIN "user" AS etudiant2 ON etudiant2.user_id = conv.id_user2
            LEFT JOIN profil AS profil1 ON profil1.id_user = conv.id_user1
            LEFT JOIN profil AS profil2 ON profil2.id_user = conv.id_user2
            LEFT JOIN mission ON mission.id_mission = conv.id_mission
            WHERE conv.id_user1 = $1 OR conv.id_user2 = $1
            ORDER BY date_dernier_message DESC NULLS LAST`,
            [user_id]
            );

            res.status(200).json({ conversations: result.rows });

        } catch (error) {
            console.error('Erreur getConversations:', error.message);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    };


    // GET — Messages d'une conversation
    const getMessages = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.user_id;

        try {
            // Vérifier que l'utilisateur fait partie de la conversation
            const check = await pool.query(
            `SELECT * FROM conversation
            WHERE id_conversation = $1
            AND (id_user1 = $2 OR id_user2 = $2)`,
            [id, user_id]
            );

            if (check.rows.length === 0) {
            return res.status(403).json({ message: 'Accès refusé' });
            }

            // Récupérer les messages
            const result = await pool.query(
            `SELECT 
                message.*,
                etudiant.nom, etudiant.prenom,
                profil.avatar_url
            FROM message
            JOIN "user" AS etudiant ON etudiant.user_id = message.id_expediteur
            LEFT JOIN profil ON profil.id_user = message.id_expediteur
            WHERE message.id_conversation = $1
            ORDER BY message.date_envoi ASC`,
            [id]
            );

            // Marquer les messages comme lus
            await pool.query(
            `UPDATE message
            SET is_read = true
            WHERE id_conversation = $1 AND id_expediteur != $2`,
            [id, user_id]
            );

            res.status(200).json({ messages: result.rows });

        } catch (error) {
            console.error('Erreur getMessages:', error.message);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    };


    // POST — Envoyer un message
    const sendMessage = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user.user_id;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Le message ne peut pas être vide' });
    }

        try {
            // Vérifier que l'utilisateur fait partie de la conversation
            const check = await pool.query(
            `SELECT * FROM conversation
            WHERE id_conversation = $1
            AND (id_user1 = $2 OR id_user2 = $2)`,
            [id, user_id]
            );

            if (check.rows.length === 0) {
            return res.status(403).json({ message: 'Accès refusé' });
            }

            const result = await pool.query(
            `INSERT INTO message (id_conversation, id_expediteur, content)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [id, user_id, content.trim()]
            );

            res.status(201).json({ message: result.rows[0] });

        } catch (error) {
            console.error('Erreur sendMessage:', error.message);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    };

module.exports = { getConversations, getMessages, sendMessage };

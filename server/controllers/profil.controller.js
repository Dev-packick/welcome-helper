const pool = require('../db/pool');

// GET profil d'un utilisateur
const getProfil = async (req, res) => {
    const { id } = req.params;
        try {
            const result = await pool.query(
            `SELECT
            etudiant.user_id, etudiant.nom, etudiant.prenom,
            etudiant.email, etudiant.role, etudiant.is_certifie,
            etudiant.solde_points, etudiant.created_at,
            profil.id_profil, profil.pays_origine, profil.universite,
            profil.bio, profil.avatar_url, profil.langue
            FROM "user" AS etudiant
            LEFT JOIN profil AS profil ON profil.id_user = etudiant.user_id
            WHERE etudiant.user_id = $1`,
            [id]
            );

            if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            res.status(200).json({ profil: result.rows[0] });

        } catch (error) {
            console.error('Erreur getProfil:', error.message);
            res.status(500).json({ message: 'Erreur serveur' });
    }
};


// PUT modifier son propre profil
const updateProfil = async (req, res) => {
        const { id } = req.params;
        const { nom, prenom, pays_origine, universite, bio, langue } = req.body;

        if (parseInt(id) !== req.user.user_id) {
            return res.status(403).json({
            message: 'Vous ne pouvez modifier que votre propre profil'
            });
        }

        try {
            await pool.query(
            `UPDATE "user" SET nom = $1, prenom = $2 WHERE user_id = $3`,
            [nom, prenom, id]
            );

            const result = await pool.query(
            `UPDATE profil SET pays_origine = $1, universite = $2, bio = $3, langue = $4 WHERE id_user = $5`,
            [pays_origine, universite, bio, langue, id]
            );

            res.status(200).json({
            message: 'Profil mis à jour avec succès',
            profil: result.rows[0]
            });

        } catch (error) {
            console.error('Erreur updateProfil:', error.message);
            res.status(500).json({ message: 'Erreur serveur' });
    }
};


// GET mon propre profil (via token JWT)
const getMonProfil = async (req, res) => {
        try {
            const result = await pool.query(
            `SELECT
            etudiant.user_id, etudiant.nom, etudiant.prenom,
            etudiant.email, etudiant.role, etudiant.is_certifie,
            etudiant.solde_points, etudiant.created_at,
            profil.id_profil, profil.pays_origine, profil.universite,
            profil.bio, profil.avatar_url, profil.langue
            FROM "user" AS etudiant
            LEFT JOIN profil AS profil ON profil.id_user = etudiant.user_id
            WHERE etudiant.user_id = $1`,
            [req.user.user_id]
            );

            res.status(200).json({ profil: result.rows[0] });

        } catch (error) {
            console.error('Erreur getMonProfil:', error.message);
            res.status(500).json({ message: 'Erreur serveur' });
    }
};


// POST upload avatar
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier envoyé' });
        }

        const avatarUrl = `/uploads/${req.file.filename}`;

        await pool.query(
        `UPDATE profil SET avatar_url = $1 WHERE id_user = $2`,
        [avatarUrl, req.user.user_id]
        );

        res.status(200).json({
        message: 'Avatar mis à jour avec succès',
        avatar_url: avatarUrl
        });

    } catch (error) {
        console.error('Erreur uploadAvatar:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { getProfil, updateProfil, getMonProfil, uploadAvatar };
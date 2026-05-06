const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// *****INSCRIPTION*****
const register = async (req, res) => {

    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nom, prenom, email, password, role } = req.body;

    try {
        // Vérifier si l'email existe déjà
        const emailExist = await pool.query(
        'SELECT * FROM "user" WHERE email = $1',
        [email]
        );

        if (emailExist.rows.length > 0) {
        return res.status(409).json({
            message: 'Cet email est déjà utilisé'
        });
        }

        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insérer l'utilisateur
        const newUser = await pool.query(
        `INSERT INTO "user" (nom, prenom, email, password, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id, nom, prenom, email, role`,
        [nom, prenom, email, hashedPassword, role]
        );

        const user = newUser.rows[0];

        // Créer le profil automatiquement
        await pool.query(
        'INSERT INTO profil (id_user) VALUES ($1)',
        [user.user_id]
        );

        // Générer le token JWT
        const token = jwt.sign(
        { user_id: user.user_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
        );

        res.status(201).json({
        message: 'Compte créé avec succès',
        token,
        user: {
            user_id: user.user_id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role
        }
        });

    } catch (error) {
        console.error('Erreur register:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};


// *****CONNEXION*****
const login = async (req, res) => {

    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe
        const result = await pool.query(
        'SELECT * FROM "user" WHERE email = $1',
        [email]
        );

        if (result.rows.length === 0) {
        return res.status(401).json({
            message: 'Email ou mot de passe incorrect'
        });
        }

        const user = result.rows[0];

        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
        return res.status(401).json({
            message: 'Email ou mot de passe incorrect'
        });
        }

        // Générer le token JWT
        const token = jwt.sign(
        { user_id: user.user_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
        );

        res.status(200).json({
        message: 'Connexion réussie',
        token,
        user: {
            user_id: user.user_id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            solde_points: user.solde_points,
            is_certifie: user.is_certifie
        }
        });

    } catch (error) {
        console.error('Erreur login:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { register, login };

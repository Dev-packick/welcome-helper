const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { body } = require('express-validator');

// Règles de validation inscription
const registerValidation = [
    body('nom')
        .notEmpty().withMessage('Le nom est obligatoire')
        .isLength({ min: 2 }).withMessage('Le nom doit faire au moins 2 caractères'),
    body('prenom')
        .notEmpty().withMessage('Le prénom est obligatoire')
        .isLength({ min: 2 }).withMessage('Le prénom doit faire au moins 2 caractères'),
    body('email')
        .notEmpty().withMessage("L'email est obligatoire")
        .isEmail().withMessage("Format d'email invalide")
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Le mot de passe est obligatoire')
        .isLength({ min: 8 }).withMessage('Le mot de passe doit faire au moins 8 caractères'),
    body('role')
        .notEmpty().withMessage('Le rôle est obligatoire')
        .isIn(['etranger', 'resident']).withMessage('Le rôle doit être etranger ou resident'),
    ];

    // Règles de validation connexion
    const loginValidation = [
    body('email')
        .notEmpty().withMessage("L'email est obligatoire")
        .isEmail().withMessage("Format d'email invalide")
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Le mot de passe est obligatoire'),
];

// POST /api/auth/register
router.post('/register', registerValidation, register);

// POST /api/auth/login
router.post('/login', loginValidation, login);


const authMiddleware = require('../middlewares/auth.middleware');

// GET /api/auth/me - route protégée (test middleware)
router.get('/me', authMiddleware, (req, res) => {
    res.json({
        message: 'Token valide',
        user: req.user
    });
});

module.exports = router;

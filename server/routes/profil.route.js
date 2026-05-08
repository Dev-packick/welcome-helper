const express = require('express');
const router = express.Router();
const {
    getProfil,
    updateProfil,
    getMonProfil
    } = require('../controllers/profil.controller');
    const authMiddleware = require('../middlewares/auth.middleware');
    const { body } = require('express-validator');

    // Validation pour la modification du profil
    const updateValidation = [
    body('nom')
        .notEmpty().withMessage('Le nom est obligatoire')
        .isLength({ min: 2 }).withMessage('Minimum 2 caractères'),
    body('prenom')
        .notEmpty().withMessage('Le prénom est obligatoire')
        .isLength({ min: 2 }).withMessage('Minimum 2 caractères'),
    body('bio')
        .optional()
        .isLength({ max: 500 }).withMessage('La bio ne peut pas dépasser 500 caractères'),
];

// GET /api/profil/me — mon profil (protégé)
router.get('/me', authMiddleware, getMonProfil);

// GET /api/profil/:id — profil public
router.get('/:id', getProfil);

// PUT /api/profil/:id — modifier son profil (protégé)
router.put('/:id', authMiddleware, updateValidation, updateProfil);

module.exports = router;

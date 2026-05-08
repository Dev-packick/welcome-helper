const { getProfil, updateProfil, getMonProfil, uploadAvatar } = require('../controllers/profil.controller');
const express = require('express');

const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

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
// POST /api/profil/avatar — upload avatar (protégé)
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

module.exports = router;

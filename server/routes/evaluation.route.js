const express = require('express');
const router = express.Router();
const {
    createEvaluation,
    getEvaluations
} = require('../controllers/evaluation.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

const evalValidation = [
    body('id_mission')
        .notEmpty().withMessage('La mission est obligatoire')
        .isInt().withMessage('ID mission invalide'),
    body('note')
        .notEmpty().withMessage('La note est obligatoire')
        .isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5'),
    body('commentaire')
        .optional()
        .isLength({ max: 500 }).withMessage('Commentaire max 500 caractères'),
];

// POST /api/evaluations - créer une évaluation
router.post('/', authMiddleware, evalValidation, createEvaluation);

// GET /api/evaluations/user/:id - évaluations d'un utilisateur
router.get('/user/:id', getEvaluations);

module.exports = router;

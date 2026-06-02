const express = require('express');
const router = express.Router();
const {
    createMission,
    getMissions,
    getMissionById,
    updateMission,
    deleteMission,
    accepterMission,
    terminerMission
} = require('../controllers/mission.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

// Validation mission
const missionValidation = [
    body('titre')
        .notEmpty().withMessage('Le titre est obligatoire')
        .isLength({ min: 5, max: 150 }).withMessage('Titre entre 5 et 150 caractères'),
    body('desc_mission')
        .notEmpty().withMessage('La description est obligatoire')
        .isLength({ min: 10 }).withMessage('Description minimum 10 caractères'),
    body('cat_mission')
        .notEmpty().withMessage('La catégorie est obligatoire'),
    body('points_offerts')
    .isInt({ min: 5, max: 100 }).withMessage('Points entre 5 et 100'),
    ];

// GET /api/missions — liste publique avec filtres
router.get('/', getMissions);

// GET /api/missions/:id — détail d'une mission
router.get('/:id', getMissionById);

// POST /api/missions — créer une mission (protégé)
router.post('/', authMiddleware, missionValidation, createMission);

// PUT /api/missions/:id — modifier (protégé)
router.put('/:id', authMiddleware, missionValidation, updateMission);

// DELETE /api/missions/:id — supprimer (protégé)
router.delete('/:id', authMiddleware, deleteMission);

// POST /api/missions/:id/accepter — accepter une mission (protégé)
router.post('/:id/accepter', authMiddleware, accepterMission);

// POST /api/missions/:id/terminer — terminer une mission
router.post('/:id/terminer', authMiddleware, terminerMission);

module.exports = router;

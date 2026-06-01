const express = require('express');
const router = express.Router();
const {
    getRecompenses,
    getRecompenseById,
    echangerRecompense
} = require('../controllers/recompense.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET /api/recompenses
router.get('/', getRecompenses);

// GET /api/recompenses/:id
router.get('/:id', getRecompenseById);

// POST /api/recompenses/:id/echanger (protégé)
router.post('/:id/echanger', authMiddleware, echangerRecompense);

module.exports = router;

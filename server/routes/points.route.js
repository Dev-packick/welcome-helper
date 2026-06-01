const express = require('express');
const router = express.Router();
const { getMonSolde } = require('../controllers/points.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET /api/points/me — solde + historique
router.get('/me', authMiddleware, getMonSolde);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    getRecompenses,
    getRecompenseById
} = require('../controllers/recompense.controller');

// GET /api/recompenses — liste avec filtre catégorie
router.get('/', getRecompenses);

// GET /api/recompenses/:id — détail
router.get('/:id', getRecompenseById);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    getStats,
    getUsers,
    certifierUser,
    deleteUser,
    getMissionsAdmin,
    deleteMissionAdmin
} = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

// Toutes les routes admin nécessitent JWT + rôle admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Statistiques
router.get('/stats', getStats);

// Utilisateurs
router.get('/users', getUsers);
router.put('/users/:id/certifier', certifierUser);
router.delete('/users/:id', deleteUser);

// Missions
router.get('/missions', getMissionsAdmin);
router.delete('/missions/:id', deleteMissionAdmin);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    getStats, getUsers, certifierUser, deleteUser,
    getMissionsAdmin, deleteMissionAdmin,
    getPartenaires, createPartenaire, updatePartenaire, deletePartenaire,
    getRecompensesPartenaire, createRecompense, updateRecompense, deleteRecompense
} = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const { uploadLogo, uploadRecompense } = require('../middlewares/upload.middleware');

router.use(authMiddleware);
router.use(adminMiddleware);

// Stats
router.get('/stats', getStats);

// Utilisateurs
router.get('/users', getUsers);
router.put('/users/:id/certifier', certifierUser);
router.delete('/users/:id', deleteUser);

// Missions
router.get('/missions', getMissionsAdmin);
router.delete('/missions/:id', deleteMissionAdmin);

// Upload logo - AVANT /:id
router.post('/partenaires/upload-logo',
    uploadLogo.single('logo'),
    (req, res) => {
        if (!req.file) return res.status(400).json({ message: 'Aucun fichier' });
        res.status(200).json({ logo_url: `/uploads/logos/${req.file.filename}` });
    }
);

// Upload image récompense - AVANT /:id
router.post('/recompenses/upload-image',
    uploadRecompense.single('image'),
    (req, res) => {
        if (!req.file) return res.status(400).json({ message: 'Aucun fichier' });
        res.status(200).json({ image_url: `/uploads/recompenses/${req.file.filename}` });
    }
);

// Partenaires
router.get('/partenaires', getPartenaires);
router.post('/partenaires', createPartenaire);
router.get('/partenaires/:id/recompenses', getRecompensesPartenaire);
router.post('/partenaires/:id/recompenses', createRecompense);
router.put('/partenaires/:id', updatePartenaire);
router.delete('/partenaires/:id', deletePartenaire);

// Récompenses
router.put('/recompenses/:id', updateRecompense);
router.delete('/recompenses/:id', deleteRecompense);

module.exports = router;

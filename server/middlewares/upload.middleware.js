const multer = require('multer');
const path = require('path');

const imageFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png',
        'image/webp', 'image/svg+xml'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format non supporté. Utilisez JPG, PNG, WebP ou SVG.'), false);
    }
    };

    // Stockage avatars
    const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `avatar_${req.user.user_id}_${Date.now()}${ext}`;
        cb(null, filename);
    }
    });

    // Stockage logos partenaires
    const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/logos/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `logo_${Date.now()}${ext}`;
        cb(null, filename);
    }
    });

    // Stockage images récompenses
    const recompenseStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/recompenses/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `recompense_${Date.now()}${ext}`;
        cb(null, filename);
    }
    });

    const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
    });

    const uploadLogo = multer({
    storage: logoStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
    });

    const uploadRecompense = multer({
    storage: recompenseStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});

module.exports = { uploadAvatar, uploadLogo, uploadRecompense };
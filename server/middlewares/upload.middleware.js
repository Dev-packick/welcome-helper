const multer = require('multer');
const path = require('path');

    // Configuration du stockage
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            // Nom unique : user_id + timestamp + extension
            const ext = path.extname(file.originalname);
            const filename = `avatar_${req.user.user_id}_${Date.now()}${ext}`;
            cb(null, filename);
        }
    });

    // Filtre — accepte uniquement les images
    const fileFilter = (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format non supporté. Utilisez JPG, PNG ou WebP.'), false);
        }
    };

    const upload = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 2 * 1024 * 1024 // 2 Mo maximum
        }
    });

module.exports = upload;

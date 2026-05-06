const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Récupérer le token dans le header
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
        return res.status(401).json({
            message: 'Accès refusé — token manquant'
        });
        }

        // Le token arrive sous la forme "Bearer eyJhbGci..."
        // On prend juste la partie après "Bearer "
        const token = authHeader.split(' ')[1];

        if (!token) {
        return res.status(401).json({
            message: 'Accès refusé — format token invalide'
        });
        }

        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Injecter les infos de l'utilisateur dans la requête
        req.user = decoded;

        // Passer à la suite
        next();

    } catch (error) {
        return res.status(401).json({
        message: 'Token invalide ou expiré'
        });
    }
};

module.exports = authMiddleware;

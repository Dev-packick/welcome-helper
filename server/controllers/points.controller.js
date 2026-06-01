const { getHistorique, getSolde } = require('../utils/pointsService');

// GET - Solde et historique de l'utilisateur connecté
const getMonSolde = async (req, res) => {
    try {
        const solde = await getSolde(req.user.user_id);
        const historique = await getHistorique(req.user.user_id);

        res.status(200).json({ solde, historique });

    } catch (error) {
        console.error('Erreur getMonSolde:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { getMonSolde };

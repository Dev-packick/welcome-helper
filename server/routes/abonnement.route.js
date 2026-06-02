const express = require('express');
const router = express.Router();
const {
    createCheckoutSession,
    getMonAbonnement,
    stripeWebhook
    } = require('../controllers/abonnement.controller');
    const authMiddleware = require('../middlewares/auth.middleware');


    // GET /api/abonnement/me — statut abonnement
    router.get('/me', authMiddleware, getMonAbonnement);


    // POST /api/abonnement/checkout — créer session Stripe
    router.post('/checkout', authMiddleware, createCheckoutSession);

    
    // POST /api/abonnement/webhook — webhook Stripe (raw body)
    router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    stripeWebhook
);

module.exports = router;

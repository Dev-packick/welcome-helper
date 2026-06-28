const pool = require('../db/pool');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


// POST - Créer une session Stripe Checkout
const createCheckoutSession = async (req, res) => {
    const { type_offre } = req.body;
    const user_id = req.user.user_id;

    try {
        const priceId = type_offre === 'mensuel'
        ? process.env.STRIPE_PRICE_MENSUEL
        : process.env.STRIPE_PRICE_TRIMESTRIEL;
        if (!priceId) {
        return res.status(400).json({ message: 'Offre invalide' });
        }

        const userResult = await pool.query(
        'SELECT * FROM "user" WHERE user_id = $1',
        [user_id]
        );
        const user = userResult.rows[0];

        const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: user.email,
        line_items: [
            {
            price: priceId,
            quantity: 1,
            }
        ],
        metadata: {
            user_id: user_id.toString(),
            type_offre
        },
        success_url: `${process.env.FRONTEND_URL}/abonnement/succes?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/premium`,
        });

        res.status(200).json({ url: session.url });

    } catch (error) {
        console.error('Erreur createCheckoutSession:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// GET - Statut abonnement de l'utilisateur connecté
const getMonAbonnement = async (req, res) => {
    try {
        const result = await pool.query(
        `SELECT * FROM abonnement
        WHERE id_user = $1
        ORDER BY date_debut DESC
        LIMIT 1`,
        [req.user.user_id]
        );
        if (result.rows.length === 0) {
        return res.status(200).json({ abonnement: null });
        }

        res.status(200).json({ abonnement: result.rows[0] });

    } catch (error) {
        console.error('Erreur getMonAbonnement:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};


// POST - Webhook Stripe
const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error('Webhook signature invalide:', error.message);
        return res.status(400).json({ message: `Webhook Error: ${error.message}` });
    }

    try {
        switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const user_id = parseInt(session.metadata.user_id);
            const type_offre = session.metadata.type_offre;

            const date_debut = new Date();
            const date_expiration = new Date();
            if (type_offre === 'mensuel') {
            date_expiration.setMonth(date_expiration.getMonth() + 1);
            } else {
            date_expiration.setMonth(date_expiration.getMonth() + 3);
            }

            
            await pool.query(
            `INSERT INTO abonnement
                (id_user, type_offre, prix, date_debut, date_expiration, statut_paiement)
            VALUES ($1, $2, $3, $4, $5, 'paye')
            ON CONFLICT (id_user)
            DO UPDATE SET
                type_offre = $2,
                prix = $3,
                date_debut = $4,
                date_expiration = $5,
                statut_paiement = 'paye'`,
            [
                user_id,
                type_offre,
                type_offre === 'mensuel' ? 9.99 : 24.99,
                date_debut,
                date_expiration
            ]
            );

            console.log(`Abonnement ${type_offre} activé pour user ${user_id}`);
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            console.log('Abonnement annulé:', subscription.id);
            break;
        }

        default:
            console.log(`Événement non géré: ${event.type}`);
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Erreur webhook:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { createCheckoutSession, getMonAbonnement, stripeWebhook };

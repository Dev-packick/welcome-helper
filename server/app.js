const path = require('path');

// Charger le bon .env selon l'environnement
require('dotenv').config({
    path: path.resolve(__dirname, process.env.NODE_ENV === 'test' ? '.env.test' : '.env')
});

const express = require('express');
const cors = require('cors');

const app = express();

// Webhook Stripe — raw body AVANT express.json()
app.use('/api/abonnement/webhook',
    express.raw({ type: 'application/json' }),
    require('./routes/abonnement.route')
);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',        require('./routes/auth.route'));
app.use('/api/profil',      require('./routes/profil.route'));
app.use('/api/missions',    require('./routes/mission.route'));
app.use('/api/messages',    require('./routes/message.route'));
app.use('/api/evaluations', require('./routes/evaluation.route'));
app.use('/api/points',      require('./routes/points.route'));
app.use('/api/recompenses', require('./routes/recompense.route'));
app.use('/api/abonnement',  require('./routes/abonnement.route'));
app.use('/api/admin',       require('./routes/admin.route'));
app.use('/api/dashboard',   require('./routes/dashboard.route'));

module.exports = app;

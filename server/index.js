const abonnementRoutes = require('./routes/abonnement.route');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.route');
const profilRoutes = require('./routes/profil.route');
const missionRoutes = require('./routes/mission.route');
const messageRoutes = require('./routes/message.route');
const evaluationRoutes = require('./routes/evaluation.route');
const pointsRoutes = require('./routes/points.route');
const recompenseRoutes = require('./routes/recompense.route');
const adminRoutes = require('./routes/admin.route');

const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Le webhook Stripe doit recevoir le raw body — avant express.json()
app.use('/api/abonnement/webhook', express.raw({ type: 'application/json' }), require('./routes/abonnement.route'));
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profil', profilRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/missions', missionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/recompenses', recompenseRoutes);
app.use('/api/abonnement', abonnementRoutes);
app.use('/api/admin', adminRoutes);


// Route de test
app.get('/', (req, res) => {res.json({ message: 'WelcomeHelper API fonctionne !' });
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});

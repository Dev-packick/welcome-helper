const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.route');
const profilRoutes = require('./routes/profil.route');
const missionRoutes = require('./routes/mission.route');
const messageRoutes = require('./routes/message.route');
const evaluationRoutes = require('./routes/evaluation.route');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profil', profilRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/missions', missionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/evaluations', evaluationRoutes);


// Route de test
app.get('/', (req, res) => {res.json({ message: 'WelcomeHelper API fonctionne !' });
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});

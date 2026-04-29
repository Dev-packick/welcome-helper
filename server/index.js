const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
    res.json({ message: 'WelcomeHelper API fonctionne !' });
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});

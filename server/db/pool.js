const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const pool = new Pool({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
    });

    pool.connect((err, client, release) => {
    if (err) {
        console.error('Erreur connexion PostgreSQL:', err.message);
    } else {
        console.log('PostgreSQL connecté avec succès');
        release();
    }
});

module.exports = pool;
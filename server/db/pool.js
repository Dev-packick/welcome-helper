const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '..', process.env.NODE_ENV === 'test' ? '.env.test' : '.env')
});

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
});

if (process.env.NODE_ENV !== 'test') {
  pool.connect()
    .then(() => console.log('PostgreSQL connecté avec succès'))
    .catch(err => console.error('Erreur connexion PostgreSQL:', err.message));
}

module.exports = pool;
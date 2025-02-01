const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER || process.env.USER,
    host: 'localhost',
    database: 'chat_app',
    password: '',  // Using default PostgreSQL authentication
    port: 5432,
});

module.exports = pool;

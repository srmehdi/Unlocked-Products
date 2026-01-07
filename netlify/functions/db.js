const { Pool } = require('pg');

function sanitizeConnectionString(conn) {
  if (!conn) return conn;
  try {
    const url = new URL(conn);
    url.searchParams.delete('sslmode');
    url.searchParams.delete('channel_binding');
    return url.toString();
  } catch (e) {
    return conn;
  }
}

const connectionString = sanitizeConnectionString(process.env.DATABASE_URL);

// Create a pool outside the handler to reuse between invocations
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected PG client error', err);
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { query };

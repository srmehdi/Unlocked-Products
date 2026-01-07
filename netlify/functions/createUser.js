const { query } = require('./db');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { email, password, name } = body;
    if (!email || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing email or password' }) };
    }

    const res = await query(
      'INSERT INTO "user" (email, password, name) VALUES ($1, $2, $3) RETURNING *',
      [email, password, name || null]
    );

    return { statusCode: 201, body: JSON.stringify(res.rows[0] || {}) };
  } catch (err) {
    console.error('createUser function error', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Server error' }) };
  }
};

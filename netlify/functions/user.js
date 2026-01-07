const { query } = require('./db');

exports.handler = async (event) => {
  try {
    const email = event.queryStringParameters?.email || '';
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing email' }) };
    }

    const res = await query('SELECT * FROM "user" WHERE email = $1 LIMIT 1', [email]);
    return {
      statusCode: 200,
      body: JSON.stringify(res.rows || []),
    };
  } catch (err) {
    console.error('Function error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Server error' }),
    };
  }
};

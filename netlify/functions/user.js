const { query } = require('./db');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ hasError: true, businessMessage: 'Method not allowed', data: null }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { email, password } = body;
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          hasError: true,
          businessMessage: 'Missing email or password',
          data: null,
        }),
      };
    }

    const res = await query('SELECT * FROM "user" WHERE email = $1 LIMIT 1', [email]);

    if (res.rowCount === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          hasError: true,
          businessMessage: 'You are not registered!',
          data: null,
        }),
      };
    }

    const isValid = await bcrypt.compare(password, res.rows[0].password);

    if (!isValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          hasError: true,
          businessMessage: 'Wrong password. Please check and try again.',
          data: null,
        }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ hasError: false, businessMessage: 'success', data: res.rows || [] }),
    };
  } catch (err) {
    console.error('user error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ hasError: true, businessMessage: 'Server error', data: null }),
    };
  }
};

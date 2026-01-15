const { query } = require('./db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { token, userId, newPassword } = body;

    if (!token || !userId || !newPassword) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request' }),
      };
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const res = await query(
      `SELECT id FROM password_resets
       WHERE user_id = $1
       AND token_hash = $2
       AND expires_at > NOW()
       AND used = false`,
      [userId, tokenHash]
    );

    if (res.rowCount === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid or expired token' }),
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query('UPDATE "user" SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    await query('UPDATE password_resets SET used = true WHERE user_id = $1', [userId]);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('reset-password error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};

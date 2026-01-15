const { query } = require('./db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.handler = async (event) => {
  console.log(
    'send-reset',
    process.env.SMTP_HOST,
    process.env.SMTP_PASS,
    process.env.SMTP_USER,
    process.env.DATABASE_URL,
    process.env.NODE_ENV
  );

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { email } = body;

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }
    const userRes = await query('SELECT id FROM "user" WHERE email = $1', [email.toLowerCase()]);

    if (userRes.rowCount === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ error: 'You are not registered!' }),
      };
    }

    const userId = userRes.rows[0].id;

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password` + `?token=${token}&id=${userId}`;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Reset your UnlockedProducts password',
      html: `
        <div style="font-family:Arial;line-height:1.6">
          <h2>Password Reset</h2>
          <p>You requested a password reset.</p>
          <p>
            <a href="${resetLink}"
               style="background:#2563eb;color:#fff;
                      padding:10px 16px;
                      border-radius:6px;
                      text-decoration:none">
              Reset Password
            </a>
          </p>
          <p>This link expires in 1 hour.</p>
        </div>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('send-reset error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};

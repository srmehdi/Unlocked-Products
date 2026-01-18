const { query } = require('./db');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { productId, userId, comment, rating, monthsUsed } = body;
    if (!productId || !userId || !comment || !rating || !monthsUsed) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid rating' }),
      };
    }

    if (!Number.isInteger(monthsUsed) || monthsUsed < 1) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid months used' }),
      };
    }

    const result = await query(
      `
      INSERT INTO experience
        (product_id, user_id, comment, rating, months_used)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [productId, userId, comment, rating, monthsUsed]
    );

    // return {
    //   statusCode: 201,
    //   body: JSON.stringify(result.rows[0]),
    // };
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('submit-experience error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};

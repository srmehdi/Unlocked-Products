const { query } = require('./db');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const body = event.body ? JSON.parse(event.body) : {};

    const { productId } = body;

    if (!productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'productId is required' }),
      };
    }

    const result = await query(
      //   `
      //   SELECT
      //     e.id,
      //     e.comment,
      //     e.rating,
      //     e.months_used AS "monthsUsed",
      //     e.created_at AS "createdAt",
      //     u.name AS "userName",
      //     u.id AS "userId",
      //     COALESCE(e.helpful, 0) AS helpful,
      //     COALESCE(e.not_helpful, 0) AS "notHelpful"
      //   FROM "experience" e
      //   JOIN "user" u ON u.id = e.user_id
      //   WHERE e.product_id = $1
      //   ORDER BY e.created_at DESC
      //   `,
      //   [productId]
      `
      SELECT 
        e.id,
        e.comment,
        e.rating,
        e.months_used AS "monthsUsed",
        e.created_at AS "createdAt",
        u.name AS "userName",
        u.id AS "userId",
        u.email AS "mail"
      FROM "experience" e
      JOIN "user" u ON u.id = e.user_id
      WHERE e.product_id = $1
      ORDER BY e.created_at DESC
      `,
      [productId],
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    console.error('get-experiences error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};

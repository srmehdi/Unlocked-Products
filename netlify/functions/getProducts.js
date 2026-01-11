const { query } = require('./db');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const body = event.body ? JSON.parse(event.body) : {};

    const { category } = body;
    if (!category) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing category' }) };
    }

    // const res = await query('SELECT * FROM "product"');
    const res = await query(`
      SELECT
        p.id,
        p.productname,
        p.productsummary,
        p.editorreview,
        p.editorrating,
        COALESCE(
          json_agg(pi.image_base64 ORDER BY pi.id)
          FILTER (WHERE pi.image_base64 IS NOT NULL),
          '[]'
        ) AS images
      FROM product p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    const products = res.rows.map((r) => ({
      id: r.id,
      productName: r.productname,
      productSummary: r.productsummary,
      editorReview: r.editorreview,
      editorRating: r.editorrating,
      imageBase64: r.images,
    }));
    return {
      statusCode: 200,
      body: JSON.stringify(products || []),
    };
  } catch (err) {
    console.error('getProduct function error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Server error' }),
    };
  }
};

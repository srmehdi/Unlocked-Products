const { query } = require('./db');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const body = event.body ? JSON.parse(event.body) : {};

    const { productName, productSummary, editorReview, editorRating, imageBase64 } = body;
    if (!productName || !productSummary || !editorReview || !editorRating) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const res = await query(
      'INSERT INTO "product" (productName, productSummary, editorReview, editorRating) VALUES ($1, $2, $3, $4) RETURNING *',
      [productName, productSummary, editorReview, editorRating || null]
    );

    const productId = res.rows[0].id;

    for (let i = 0; i < imageBase64.length; i++) {
      await query(
        `INSERT INTO product_images (product_id, image_base64)
           VALUES ($1, $2)`,
        [productId, imageBase64[i]]
      );
    }

    // const products = res.rows.map((r) => ({
    //   id: r.id,
    //   productName: r.productname,
    //   productSummary: r.productsummary,
    //   editorReview: r.editorreview,
    //   editorRating: r.editorrating,
    // }));
    return {
      statusCode: 200,
      body: JSON.stringify(productId || {}),
    };
  } catch (err) {
    console.error('addProduct function error', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Server error' }) };
  }
};

import { Handler } from '@netlify/functions';
import { query } from './db';

export const handler: Handler = async (event) => {
  try {
    const { visitorId } = JSON.parse(event.body || '{}');

    if (!visitorId) {
      return { statusCode: 400, body: 'Missing visitorId' };
    }

    await query(
      `
    INSERT INTO visitors (visitor_id, last_seen)
    VALUES ($1, NOW())
    ON CONFLICT (visitor_id)
    DO UPDATE SET last_seen = NOW();
  `,
      [visitorId],
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('heartBeat function error', err);
    return { statusCode: 500, body: JSON.stringify({ error: err || 'Server error' }) };
  }
};

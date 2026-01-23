import { Handler } from '@netlify/functions';
import { query } from './db';

export const handler: Handler = async () => {
  try {
    const activeResult = await query(`
    SELECT COUNT(*) AS count
    FROM visitors
    WHERE last_seen > NOW() - INTERVAL '30 seconds'
  `);

    const totalResult = await query(`
    SELECT COUNT(*) AS count
    FROM visitors
  `);

    return {
      statusCode: 200,
      body: JSON.stringify({
        activeUsers: activeResult.rows,
        totalUsers: totalResult.rows,
      }),
    };
  } catch (err) {
    console.error('activityStats function error', err);
    return { statusCode: 500, body: JSON.stringify({ error: err || 'Server error' }) };
  }
};

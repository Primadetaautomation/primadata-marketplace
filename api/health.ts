import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, candidates } from '../backend/src/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'x-api-key');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Test database connection
    await db.select().from(candidates).limit(1);

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
}
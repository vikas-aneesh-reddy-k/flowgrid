import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

// Health check endpoint for Docker and load balancers
router.get('/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    
    if (dbState !== 1) {
      return res.status(503).json({
        status: 'unhealthy',
        database: dbStatus,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      status: 'healthy',
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;

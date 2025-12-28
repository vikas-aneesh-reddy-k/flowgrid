// Health check endpoint for backend
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        const healthCheck = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            services: {}
        };

        // Check database connection
        try {
            const dbState = mongoose.connection.readyState;
            const dbStates = {
                0: 'disconnected',
                1: 'connected',
                2: 'connecting',
                3: 'disconnecting'
            };
            
            healthCheck.services.database = {
                status: dbState === 1 ? 'healthy' : 'unhealthy',
                state: dbStates[dbState],
                host: mongoose.connection.host,
                name: mongoose.connection.name
            };

            // Perform a simple database operation
            if (dbState === 1) {
                await mongoose.connection.db.admin().ping();
                healthCheck.services.database.ping = 'success';
            }
        } catch (error) {
            healthCheck.services.database = {
                status: 'unhealthy',
                error: error.message
            };
        }

        // Check memory usage
        const memUsage = process.memoryUsage();
        healthCheck.memory = {
            rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
            external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
        };

        // Determine overall health status
        const isHealthy = Object.values(healthCheck.services).every(
            service => service.status === 'healthy'
        );

        if (isHealthy) {
            res.status(200).json(healthCheck);
        } else {
            healthCheck.status = 'DEGRADED';
            res.status(503).json(healthCheck);
        }
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Readiness check endpoint
router.get('/ready', async (req, res) => {
    try {
        // Check if all required services are ready
        const checks = [];

        // Database readiness
        checks.push(
            mongoose.connection.readyState === 1 &&
            await mongoose.connection.db.admin().ping()
        );

        const isReady = checks.every(check => check === true);

        if (isReady) {
            res.status(200).json({
                status: 'READY',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({
                status: 'NOT_READY',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(503).json({
            status: 'NOT_READY',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Liveness check endpoint
router.get('/live', (req, res) => {
    res.status(200).json({
        status: 'ALIVE',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

export default router;
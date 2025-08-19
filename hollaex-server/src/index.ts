import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';    
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler'
import { config } from './config';

const app = express();

//security middleware
app.use(helmet());
app.use(cors({
    origin: config.frontend.url,
    credentials: true,
}));

//rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    }
});

//Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

//Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

//Routes

//Error handing
app.use(errorHandler);

//404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not Found',
    });
});

async function startServer() {
    try {
        //connect to mongo
        await mongoose.connect(config.mongodb.uri);
        logger.info('Connected to MongoDB');
        
        //Start server
        app.listen(config.port, () => {
            logger.info(`Server running on port ${config.port}`);
            logger.info(`Environment: ${config.nodeEnv}`);
            logger.info(`Frontend URL: ${config.frontend.url}`);
        });
    } catch (error) {
        logger.error('Error starting server:', error);
    }
}

startServer();

    
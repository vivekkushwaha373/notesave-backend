// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import { globalErrorHandler, notFound } from './middleware/errorHandler';
import cookieParser from 'cookie-parser';


// Load environment variables
dotenv.config();

const app = express();

console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// CORS configuration
const corsOptions = {
    origin: [
        'https://notesave-frontend.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
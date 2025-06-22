
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import cookieParser from 'cookie-parser';
import connectDB from './config/database'

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
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));

// Add this after app.use(cors(corsOptions));
app.use((req, res, next) => {
    console.log('📥 Request to:', req.method, req.url);
    console.log('🍪 All cookies received:', req.cookies);
    console.log('📋 Raw cookie header:', req.headers.cookie);
    console.log('🌐 Origin header:', req.headers.origin);
    console.log('---');
    next();
});

app.use(cookieParser());
app.use(express.json());

// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
    res.send('<h1>Hii I am Running<h1>');
})

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




// import connectDB from '../config/database';



dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Promise Rejection:', err.name, err.message);
    console.log('Shutting down the server due to unhandled promise rejection');
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err.name, err.message);
    console.log('Shutting down the server due to uncaught exception');
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('💀 Process terminated');
    });
});

export default server;
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const notes_1 = __importDefault(require("./routes/notes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_1 = __importDefault(require("./config/database"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
// Add this after app.use(cors(corsOptions));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.set('trust proxy', 1);
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.get('/', (req, res) => {
    res.send('<h1>Hii I am Running<h1>');
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
app.use('/api/auth', auth_1.default);
app.use('/api/notes', notes_1.default);
// 404 handler
// import connectDB from '../config/database';
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
// Connect to database
(0, database_1.default)();
// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});
exports.default = server;

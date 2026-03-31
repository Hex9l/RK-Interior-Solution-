import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

// Routes
import userRoutes from './routes/userRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import completedWorkRoutes from './routes/completedWorkRoutes.js';
import designCategoryRoutes from './routes/designCategoryRoutes.js';
import designImageRoutes from './routes/designImageRoutes.js';
import contactInquiryRoutes from './routes/contactInquiryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import knowledgeArticleRoutes from './routes/knowledgeArticleRoutes.js';

// Initialize DB
connectDB();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// ─── CORS Configuration ───────────────────────────────────────────────────────
// Hardcoded trusted origins (production Vercel + all preview deployments)
const TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://rk-interior-solution-frontend.vercel.app",   // Production Vercel
    "https://rk-interior-solution.vercel.app",             // Alternate Vercel alias
];

// Also accept any Vercel preview deployment (*.vercel.app) & env-injected URLs
const clientUrls = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(u => u.trim())
    : [];

const corsOriginFn = (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);

    // Allow if origin is in the trusted list
    if (TRUSTED_ORIGINS.includes(origin)) return callback(null, true);

    // Allow any extra CLIENT_URL values from environment
    if (clientUrls.includes(origin)) return callback(null, true);

    // Allow any Vercel preview deployment URL pattern: https://*.vercel.app
    if (/^https:\/\/[a-zA-Z0-9-]+-[a-zA-Z0-9]+\.vercel\.app$/.test(origin)) {
        return callback(null, true);
    }

    callback(new Error(`CORS policy blocked origin: ${origin}`));
};

// Socket.io setup
export const io = new Server(httpServer, {
    cors: {
        origin: corsOriginFn,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("Client connected to Socket.IO", socket.id);
});

// Middleware
app.use(morgan('dev'));
app.use(cors({
    origin: corsOriginFn,
    credentials: true,
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/works', completedWorkRoutes);
app.use('/api/design-categories', designCategoryRoutes);
app.use('/api/design-images', designImageRoutes);
app.use('/api/inquiries', contactInquiryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/knowledge', knowledgeArticleRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    const errorDetails = `[${new Date().toISOString()}] ${err.stack}\n\n`;
    try {
        if (!fs.existsSync('logs')) fs.mkdirSync('logs');
        fs.appendFileSync('logs/error.log', errorDetails);
    } catch (logErr) {
        console.error('Failed to write to log file', logErr);
    }

    console.error(err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Start server
const server = httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Set server timeout to 10 minutes
server.timeout = 600000;
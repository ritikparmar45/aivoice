import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { NotFoundError } from './utils/customErrors.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Express configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS with dynamic multi-origin validation
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://aivoice-rho.vercel.app'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like backend-to-backend or API tools)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.includes(origin) || 
                        origin.endsWith('.vercel.app') || 
                        origin === env.ALLOWED_ORIGIN;
                        
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Ensure the temporary uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Pronunciation Assessment API is healthy and active',
    timestamp: new Date().toISOString(),
  });
});

// Import and register routes
import { router as analyzeRoutes } from './routes/analyze.js';
app.use('/api', analyzeRoutes);

// Catch-all for undefined routes
app.use((req, res, next) => {
  next(new NotFoundError(`Cannot find path ${req.originalUrl} on this server`));
});

// Global Error Handler
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});

export default server;

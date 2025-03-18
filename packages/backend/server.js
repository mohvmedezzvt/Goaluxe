import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import redis from './config/redis.js';
import { cacheHeaderMiddleware } from './middleware/cacheHeaders.js';

import connectDB from './config/database.js';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const port = process.env.PORT || 3001;

connectDB();

try {
  await redis.client.ping();
  console.log('Redis connection successful');
} catch (error) {
  console.error('Redis connection check failed:', error);
}

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow credentials (cookies, authorization headers)
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use(morgan('dev'));
app.use(mongoSanitize());
app.use(cacheHeaderMiddleware);

// Additional Header for Referrer Policy
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use('/api/auth', routes.authRoutes);
app.use('/api/users', routes.userRoutes);
app.use('/api/goals', routes.goalRoutes);
app.use('/api/analytics', routes.analyticsRoutes);
app.use('/api/rewards', routes.rewardRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

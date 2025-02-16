import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const port = process.env.PORT || 3001;

connectDB();

app.use(helmet());

// Rate Limiting: Limit repeated requests to public endpoints.
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
    origin: '*', // use process.env.CLIENT_URL || '*'
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use(morgan('dev'));
app.use(mongoSanitize());

// Additional Header to Control Referrer Policy
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/rewards', rewardRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

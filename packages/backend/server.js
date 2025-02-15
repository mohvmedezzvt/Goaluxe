import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

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
  })
);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(mongoSanitize());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/rewards', rewardRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

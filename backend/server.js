import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';

import connectDB from './config/database.js';
import goalRoutes from './routes/goalRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const port = process.env.PORT || 3001;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/goals', goalRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

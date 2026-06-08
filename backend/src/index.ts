import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './utils/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Database connection
connectDB();

import adminRoutes from './routes/adminRoutes';
import sellerRoutes from './routes/sellerRoutes';
import shopRoutes from './routes/shopRoutes';
import userRoutes from './routes/userRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import telegramRoutes from './routes/telegramRoutes';

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/telegram', telegramRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running', environment: 'world-class' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

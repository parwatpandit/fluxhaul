import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db';
import logger from './config/logger';
import authRoutes from './routes/authRoutes';
import warehouseRoutes from './routes/warehouseRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import driverRoutes from './routes/driverRoutes';
import initSocket from './sockets/locationSocket';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again later' },
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev', {
  stream: { write: (message: string) => logger.info(message.trim()) },
}));
app.use(express.json());
app.use(globalLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/drivers', driverRoutes);

// Init Socket.io
initSocket(server);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'FluxHaul API is running' });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;

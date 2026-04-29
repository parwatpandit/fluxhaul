import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db';
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

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
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
  console.log(`Server running on port ${PORT}`);
});

export default app;
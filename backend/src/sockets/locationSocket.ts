import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import DriverProfile from '../models/DriverProfile';

const initSocket = (server: http.Server): void => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Middleware to authenticate socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) return next(new Error('No token provided'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string; role: string };
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} — Role: ${socket.data.user.role}`);

    // Driver sends location update
    socket.on('updateLocation', async (data: { lat: number; lng: number; orderId: string }) => {
      try {
        // Update driver location in database
        await DriverProfile.findOneAndUpdate(
          { user: socket.data.user.id },
          { currentLocation: { lat: data.lat, lng: data.lng } }
        );

        // Broadcast location to customer tracking this order
        io.to(`order_${data.orderId}`).emit('driverLocation', {
          lat: data.lat,
          lng: data.lng,
          driverId: socket.data.user.id,
        });
      } catch (error) {
        console.error('Location update error:', error);
      }
    });

    // Customer joins order tracking room
    socket.on('trackOrder', (orderId: string) => {
      socket.join(`order_${orderId}`);
      console.log(`Customer joined tracking room: order_${orderId}`);
    });

    // Driver joins their own room
    socket.on('driverJoin', () => {
      socket.join(`driver_${socket.data.user.id}`);
      console.log(`Driver joined room: driver_${socket.data.user.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export default initSocket;
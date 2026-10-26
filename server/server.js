import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import logger from './src/utils/logger.js';
import { initSocket } from './src/sockets/socket.js';

const PORT = 3000;

await connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, methods: ['GET','POST','PUT','PATCH','DELETE'], credentials: true }
});

initSocket(io);

// Make io globally accessible
app.set('io', io);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} - ${process.env.NODE_ENV}`);
});

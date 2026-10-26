import jwt from 'jsonwebtoken';
import Issue from '../models/Issue.js';
import logger from '../utils/logger.js';
import { checkSLAStatus } from '../services/sla/sla.service.js';

let ioInstance;

export const initSocket = (io) => {
  ioInstance = io;
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campuspulse_jwt_secret_dev_key_2024');
        socket.userId = decoded.id;
        socket.organizationId = decoded.organizationId;
        socket.campusId = decoded.campusId;
      }
      next();
    } catch (e) { next(); }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} user: ${socket.userId}`);
    if (socket.organizationId) {
      socket.join(`org:${socket.organizationId}`);
      if (socket.campusId) socket.join(`campus:${socket.campusId}`);
    }
    if (socket.userId) socket.join(`user:${socket.userId}`);

    socket.on('joinIssue', (issueId) => socket.join(`issue:${issueId}`));
    socket.on('leaveIssue', (issueId) => socket.leave(`issue:${issueId}`));

    socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
  });

  // Periodic SLA check every 2 mins
  setInterval(async () => {
    try {
      const mongoose = await import('mongoose');
      if (mongoose.default.connection.readyState !== 1) return;
      const atRisk = await Issue.find({ 'sla.status': { $ne: 'COMPLETED' }, status: { $nin: ['RESOLVED','CLOSED'] } });
      for (const issue of atRisk) {
        const newStatus = checkSLAStatus(issue.sla);
        if (newStatus !== issue.sla.status) {
          issue.sla.status = newStatus;
          await issue.save();
          if (newStatus==='BREACHED') {
            io.to(`org:${issue.organizationId}`).emit('sla.breached', { issueId: issue._id, priority: issue.priorityLevel });
          } else if (newStatus==='AT_RISK') {
            io.to(`org:${issue.organizationId}`).emit('sla.warning', { issueId: issue._id });
          }
        }
      }
    } catch (e) { logger.error('SLA check error '+e.message); }
  }, 120000);
};

export const getIO = () => ioInstance;
export const emitToOrg = (orgId, event, data) => { if (ioInstance) ioInstance.to(`org:${orgId}`).emit(event, data); };
export const emitToUser = (userId, event, data) => { if (ioInstance) ioInstance.to(`user:${userId}`).emit(event, data); };

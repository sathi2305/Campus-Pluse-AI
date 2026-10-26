import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { memoryStore } from '../services/memoryStore.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campuspulse_jwt_secret_dev_key_2024');

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'User not found or deactivated' });
      req.user = user;
      return next();
    }

    const user = memoryStore.findUserById(decoded.id) || {
      _id: decoded.id,
      id: decoded.id,
      name: decoded.name || 'Demo User',
      email: decoded.email || 'user@campuspulse.demo',
      role: decoded.role || 'STUDENT',
      organizationId: decoded.organizationId || 'org-tech-1',
      campusId: decoded.campusId || 'campus-main-1',
      isActive: true
    };
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      req.user = {
        _id: 'guest',
        id: 'guest',
        name: 'Campus Visitor',
        email: 'visitor@campuspulse.demo',
        role: 'STUDENT',
        organizationId: 'org-tech-1',
        campusId: 'campus-main-1',
        isActive: true
      };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campuspulse_jwt_secret_dev_key_2024');

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
        return next();
      }
    }

    const user = memoryStore.findUserById(decoded.id) || {
      _id: decoded.id,
      id: decoded.id,
      name: decoded.name || 'Demo User',
      email: decoded.email || 'user@campuspulse.demo',
      role: decoded.role || 'STUDENT',
      organizationId: decoded.organizationId || 'org-tech-1',
      campusId: decoded.campusId || 'campus-main-1',
      isActive: true
    };
    req.user = user;
    next();
  } catch (err) {
    // If token invalid, fall back to guest rather than blocking public endpoints
    req.user = {
      _id: 'guest',
      id: 'guest',
      name: 'Campus Visitor',
      email: 'visitor@campuspulse.demo',
      role: 'STUDENT',
      organizationId: 'org-tech-1',
      campusId: 'campus-main-1',
      isActive: true
    };
    next();
  }
};


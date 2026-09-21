import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { memoryStore } from '../services/memoryStore.js';

export const getNotifications = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: memoryStore.notifications });
    }
    const notifs = await Notification.find({ recipient: req.user._id }).sort({ createdAt:-1 }).limit(50);
    res.json({ success:true, data: notifs });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const markRead = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const notif = memoryStore.notifications.find(n => n._id === req.params.id);
      if (notif) notif.isRead = true;
      return res.json({ success: true, data: notif });
    }
    const notif = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true }, { new:true });
    res.json({ success:true, data: notif });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const markAllRead = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      memoryStore.notifications.forEach(n => { n.isRead = true; });
      return res.json({ success: true, message: 'All marked read' });
    }
    await Notification.updateMany({ recipient: req.user._id, isRead:false }, { isRead:true });
    res.json({ success:true, message:'All marked read' });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

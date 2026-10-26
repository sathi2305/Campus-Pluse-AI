import mongoose from 'mongoose';
import User from '../models/User.js';
import { memoryStore } from '../services/memoryStore.js';

export const getUsers = async (req, res) => {
  try {
    const { search, role, department, page=1, limit=20 } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let users = [...memoryStore.users];
      if (search) users = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
      if (role) users = users.filter(u => u.role === role);
      if (department) users = users.filter(u => u.departmentId === department);
      return res.json({ success:true, data: users, pagination: { page: parseInt(page), limit: parseInt(limit), total: users.length, pages: 1 } });
    }

    const filter = { organizationId: req.user.organizationId };
    if (search) filter.$or = [{ name: { $regex: search, $options:'i' } }, { email: { $regex: search, $options:'i' } }];
    if (role) filter.role = role;
    if (department) filter.departmentId = department;
    const skip = (parseInt(page)-1)*parseInt(limit);
    const [users, total] = await Promise.all([User.find(filter).select('-password').skip(skip).limit(parseInt(limit)).sort({ createdAt:-1 }), User.countDocuments(filter)]);
    res.json({ success:true, data: users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total/parseInt(limit)) } });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const getUserById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const user = memoryStore.findUserById(req.params.id);
      if (!user) return res.status(404).json({ success:false, message:'Not found' });
      return res.json({ success:true, data: user });
    }
    const user = await User.findOne({ _id: req.params.id, organizationId: req.user.organizationId }).select('-password');
    if (!user) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data: user });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const updateUser = async (req, res) => {
  try {
    const { role, departmentId, isActive } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const user = memoryStore.findUserById(req.params.id);
      if (!user) return res.status(404).json({ success:false, message:'Not found' });
      if (role !== undefined) user.role = role;
      if (departmentId !== undefined) user.departmentId = departmentId;
      if (isActive !== undefined) user.isActive = isActive;
      return res.json({ success:true, data: user });
    }
    const user = await User.findOneAndUpdate({ _id: req.params.id, organizationId: req.user.organizationId }, { role, departmentId, isActive }, { new:true }).select('-password');
    if (!user) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data: user });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

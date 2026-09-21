import mongoose from 'mongoose';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Campus from '../models/Campus.js';
import generateToken from '../utils/generateToken.js';
import { slugify } from '../utils/slugify.js';
import ActivityLog from '../models/ActivityLog.js';
import { memoryStore, demoOrg, demoCampus } from '../services/memoryStore.js';

const getDefaultOrgCampus = async () => {
  let org = await Organization.findOne({ slug: 'default-university' });
  if (!org) {
    org = await Organization.create({ name: 'Default University', slug: 'default-university', description: 'Demo University' });
  }
  let campus = await Campus.findOne({ organizationId: org._id, name: 'Main Campus' });
  if (!campus) {
    campus = await Campus.create({ organizationId: org._id, name: 'Main Campus', code: 'MAIN', location: 'Main Campus' });
  }
  return { org, campus };
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, organizationId, campusId, studentId } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const existing = memoryStore.findUserByEmail(email);
      if (existing) return res.status(400).json({ success:false, message:'User already exists' });
      const user = memoryStore.createUser({ name, email, role: role || 'STUDENT', studentId });
      const token = generateToken({ id: user._id, organizationId: user.organizationId, campusId: user.campusId, role: user.role });
      return res.status(201).json({ success:true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId, campusId: user.campusId }, token } });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success:false, message:'User already exists' });

    let orgId = organizationId, campId = campusId;
    if (!orgId) {
      const { org, campus } = await getDefaultOrgCampus();
      orgId = org._id; campId = campus._id;
    }

    const user = await User.create({ name, email, password, role: role||'STUDENT', organizationId: orgId, campusId: campId, studentId });
    const token = generateToken({ id: user._id, organizationId: orgId, campusId: campId, role: user.role });

    await ActivityLog.create({ organizationId: orgId, user: user._id, action: 'USER_REGISTER', entity: 'User', entityId: user._id });

    res.status(201).json({ success:true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: orgId, campusId: campId }, token } });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const user = memoryStore.findUserByEmail(email);
      if (!user) {
        // Automatically allow demo logins or create user for smooth previewing
        if (email.includes('@campuspulse.demo') || email.includes('@demo.com')) {
          const role = email.includes('admin') ? 'CAMPUS_ADMIN' : email.includes('dept') ? 'DEPARTMENT_ADMIN' : 'STUDENT';
          const newUser = memoryStore.createUser({ name: email.split('@')[0], email, role });
          const token = generateToken({ id: newUser._id, organizationId: newUser.organizationId, campusId: newUser.campusId, role: newUser.role });
          return res.json({ success:true, data: { user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, organizationId: newUser.organizationId, campusId: newUser.campusId }, token } });
        }
        return res.status(401).json({ success:false, message:'Invalid credentials' });
      }
      const token = generateToken({ id: user._id, organizationId: user.organizationId, campusId: user.campusId, role: user.role });
      return res.json({ success:true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId, campusId: user.campusId }, token } });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success:false, message:'Invalid credentials' });
    if (!user.isActive) return res.status(401).json({ success:false, message:'Account deactivated' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ success:false, message:'Invalid credentials' });
    user.lastLogin = new Date(); await user.save();
    const token = generateToken({ id: user._id, organizationId: user.organizationId, campusId: user.campusId, role: user.role });
    res.json({ success:true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId, campusId: user.campusId }, token } });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};

export const getMe = async (req, res) => {
  res.json({ success:true, data: req.user });
};

export const logout = async (req, res) => {
  res.json({ success:true, message:'Logged out' });
};

export const refresh = async (req, res) => {
  const token = generateToken({ id: req.user._id, organizationId: req.user.organizationId, campusId: req.user.campusId, role: req.user.role });
  res.json({ success:true, data: { token } });
};

export const forgotPassword = async (req, res) => {
  res.json({ success:true, message:'Password reset link sent if email exists (mock)' });
};

export const resetPassword = async (req, res) => {
  res.json({ success:true, message:'Password reset successful (mock)' });
};

import mongoose from 'mongoose';
import Department from '../models/Department.js';
import { memoryStore } from '../services/memoryStore.js';

export const getDepartments = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: memoryStore.departments });
    }
    const depts = await Department.find({ organizationId: req.user.organizationId }).populate('admins staff');
    res.json({ success:true, data: depts });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const createDepartment = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const newDept = { _id: `dept-${Date.now()}`, ...req.body };
      memoryStore.departments.push(newDept);
      return res.status(201).json({ success: true, data: newDept });
    }
    const dept = await Department.create({ ...req.body, organizationId: req.user.organizationId, campusId: req.user.campusId });
    res.status(201).json({ success:true, data: dept });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findOneAndUpdate({ _id: req.params.id, organizationId: req.user.organizationId }, req.body, { new:true });
    if (!dept) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data: dept });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const deleteDepartment = async (req, res) => {
  try {
    await Department.findOneAndDelete({ _id: req.params.id, organizationId: req.user.organizationId });
    res.json({ success:true, message:'Deleted' });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

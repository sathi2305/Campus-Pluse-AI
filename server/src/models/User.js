import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['STUDENT','FACULTY','DEPARTMENT_ADMIN','CAMPUS_ADMIN','SUPER_ADMIN'], default: 'STUDENT' },
  studentId: String,
  phone: String,
  avatar: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  preferences: { notifications: { type: Boolean, default: true }, theme: { type: String, default: 'light' } }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.index({ organizationId: 1, campusId: 1 });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);

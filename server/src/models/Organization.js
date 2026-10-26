import mongoose from 'mongoose';
const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: String,
  logo: String,
  settings: {
    allowAnonymous: { type: Boolean, default: true },
    autoAssign: { type: Boolean, default: true },
    aiEnabled: { type: Boolean, default: true },
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model('Organization', organizationSchema);

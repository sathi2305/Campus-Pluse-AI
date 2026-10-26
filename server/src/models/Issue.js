import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  anonymous: { type: Boolean, default: false },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  category: { type: String, enum: ['Water','Electricity','Internet','Hostel','Transport','Food','Security','Cleanliness','Infrastructure','Academic','Laboratory','Library','Administration','Other'], required: true },
  subcategory: { type: String },
  location: {
    campus: String,
    building: String,
    block: String,
    floor: String,
    room: String,
    coordinates: { lat: Number, lng: Number }
  },
  images: [{ url: String, publicId: String }],
  documents: [{ url: String, name: String }],
  severity: { type: Number, min: 1, max: 10, default: 5 },
  urgency: { type: String, enum: ['Low','Medium','High','Normal','Urgent','Critical'], default: 'Medium' },
  impact: { type: String, enum: ['Only me','Few students','Class','Hostel block','Department','Multiple departments','Entire campus'], default: 'Few students' },
  affectedUsers: { type: Number, default: 1 },
  sentiment: { type: String, enum: ['positive','neutral','negative','very_negative'], default: 'negative' },
  sentimentScore: { type: Number, default: -0.5 },
  priorityScore: { type: Number, min: 0, max: 100, default: 50 },
  priorityLevel: { type: String, enum: ['LOW','MEDIUM','HIGH','CRITICAL'], default: 'MEDIUM' },
  status: { type: String, enum: ['NEW','TRIAGED','ASSIGNED','IN_PROGRESS','WAITING','RESOLVED','CLOSED','REOPENED','REJECTED'], default: 'NEW' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  relatedIssues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }],
  clusterId: { type: mongoose.Schema.Types.ObjectId, ref: 'IssueCluster' },
  recurrenceScore: { type: Number, default: 0 },
  isRecurring: { type: Boolean, default: false },
  isDuplicate: { type: Boolean, default: false },
  duplicateScore: { type: Number, default: 0 },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  voteCount: { type: Number, default: 0 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  aiAnalysis: {
    mode: { type: String, enum: ['local','enhanced'], default: 'local' },
    category: String,
    subcategory: String,
    severity: Number,
    urgency: String,
    affectedUsers: Number,
    department: String,
    sentiment: String,
    summary: String,
    keywords: [String],
    entities: [String],
    duplicateProbability: Number,
    recurrenceDetected: Boolean,
    confidence: Number
  },
  sla: {
    responseDeadline: Date,
    resolutionDeadline: Date,
    respondedAt: Date,
    resolvedAt: Date,
    status: { type: String, enum: ['ON_TRACK','AT_RISK','BREACHED','COMPLETED'], default: 'ON_TRACK' },
    breachReason: String
  },
  resolution: {
    summary: String,
    steps: String,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    confirmedByReporter: { type: Boolean, default: false }
  },
  resolutionEvidence: [{ url: String, publicId: String }],
  priorityExplanation: [{ reason: String, weight: Number }],
  activityTimeline: [{ action: String, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, timestamp: Date, metadata: mongoose.Schema.Types.Mixed }]
}, { timestamps: true });

issueSchema.index({ organizationId: 1, campusId: 1, departmentId: 1 });
issueSchema.index({ category: 1, status: 1, priorityScore: -1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ priorityScore: -1 });
issueSchema.index({ status: 1 });
issueSchema.index({ 'location.building': 1 });
issueSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Issue', issueSchema);

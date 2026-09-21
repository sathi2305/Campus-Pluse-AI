import mongoose from 'mongoose';
import Issue from '../models/Issue.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import { analyzeIssue, getAIModeLabel } from '../services/ai/ai.service.js';
import { findDuplicates } from '../services/ai/duplicate.service.js';
import { detectRecurrence } from '../services/ai/recurrence.service.js';
import { calculatePriority } from '../services/priority/priority.service.js';
import { getSLADeadlines, checkSLAStatus } from '../services/sla/sla.service.js';
import { createOrUpdateCluster } from '../services/duplicate/cluster.service.js';
import { createNotification } from '../services/notification.service.js';
import ActivityLog from '../models/ActivityLog.js';
import { getIO } from '../sockets/socket.js';
import { memoryStore } from '../services/memoryStore.js';

export const analyzePreview = async (req, res) => {
  try {
    const { title, description, location, category, impact, urgency } = req.body;
    if (!title || !description) return res.status(400).json({ success:false, message:'Title and description required' });
    const analysis = await analyzeIssue({ title, description, location, categoryHint: category, impact, urgency });
    const effectiveUrgency = analysis.urgency || urgency || 'Medium';
    const priority = calculatePriority({ severity: analysis.severity, affectedUsers: analysis.affectedUsers, recurrenceScore: 2, urgency: effectiveUrgency, sentimentScore: analysis.sentimentScore, voteCount:0 });
    const sla = getSLADeadlines(priority.level);

    if (mongoose.connection.readyState !== 1) {
      const dept = memoryStore.departments.find(d => d.categories.includes(analysis.category)) || memoryStore.departments[0];
      const dups = findDuplicates({ title, description, category: analysis.category, location, createdAt: new Date() }, memoryStore.issues.slice(0, 50));
      return res.json({ success:true, data: { analysis, duplicates: dups.slice(0,5), priority, sla, department: dept, aiMode: analysis.mode, aiModeLabel: getAIModeLabel() } });
    }

    // duplicate check quick
    const existing = await Issue.find({ organizationId: req.user.organizationId, status: { $nin: ['RESOLVED','CLOSED','REJECTED'] } }).limit(100).sort({ createdAt:-1 });
    const dups = findDuplicates({ title, description, category: analysis.category, location, createdAt: new Date() }, existing);
    // dept resolve
    let dept = await Department.findOne({ organizationId: req.user.organizationId, categories: analysis.category });
    if (!dept) dept = await Department.findOne({ organizationId: req.user.organizationId, name: new RegExp(analysis.department,'i') });
    res.json({ success:true, data: { analysis, duplicates: dups.slice(0,5), priority, sla, department: dept, aiMode: analysis.mode, aiModeLabel: getAIModeLabel() } });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const createIssue = async (req, res) => {
  try {
    const { title, description, category, subcategory, location, impact, urgency, anonymous, campusId } = req.body;
    let organizationId = req.user.organizationId;
    let finalCampusId = campusId || req.user.campusId;

    const analysis = await analyzeIssue({ title, description, location, categoryHint: category, impact, urgency });

    const assignedUrgency = analysis.urgency || urgency || 'Medium';

    if (mongoose.connection.readyState !== 1) {
      const dept = memoryStore.departments.find(d => d.categories.includes(analysis.category)) || memoryStore.departments[0];
      const dups = findDuplicates({ title, description, category: analysis.category, location, createdAt: new Date() }, memoryStore.issues.slice(0, 50));
      const recurrence = detectRecurrence(memoryStore.issues, analysis.category, location?.building);
      const priority = calculatePriority({ severity: analysis.severity, affectedUsers: analysis.affectedUsers, recurrenceScore: recurrence.score, urgency: assignedUrgency, sentimentScore: analysis.sentimentScore, voteCount: 0 });
      const slaDeadlines = getSLADeadlines(priority.level);

      const newIssue = memoryStore.createIssue({
        title, description,
        category: analysis.category,
        subcategory: analysis.subcategory,
        location,
        severity: analysis.severity,
        urgency: assignedUrgency,
        impact: impact || 'Few students',
        affectedUsers: analysis.affectedUsers,
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        priorityScore: priority.score,
        priorityLevel: priority.level,
        priorityExplanation: priority.reasons,
        departmentId: dept._id,
        assignedDepartment: dept,
        reportedBy: anonymous ? null : req.user._id,
        anonymous: !!anonymous,
        recurrenceScore: recurrence.score,
        isRecurring: recurrence.isRecurring,
        duplicateScore: dups.length ? dups[0].score : 0,
        isDuplicate: dups.length && dups[0].score >= 0.85,
        duplicateOf: dups.length && dups[0].score >= 0.85 ? dups[0].issue._id : null,
        sla: { responseDeadline: slaDeadlines.responseDeadline, resolutionDeadline: slaDeadlines.resolutionDeadline, status: 'ON_TRACK' },
        aiAnalysis: { mode: analysis.mode, category: analysis.category, subcategory: analysis.subcategory, severity: analysis.severity, urgency: assignedUrgency, affectedUsers: analysis.affectedUsers, department: analysis.department, sentiment: analysis.sentiment, summary: analysis.summary, keywords: analysis.keywords, duplicateProbability: dups.length ? dups[0].score : 0, recurrenceDetected: recurrence.isRecurring, confidence: analysis.confidence }
      });

      const io = getIO();
      if (io) {
        io.to(`org:${organizationId}`).emit('issue.created', newIssue);
      }
      return res.status(201).json({ success: true, data: newIssue });
    }

    let dept = await Department.findOne({ organizationId, categories: analysis.category });
    if (!dept) dept = await Department.findOne({ organizationId, name: new RegExp(analysis.department,'i') });

    const existingForDup = await Issue.find({ organizationId, status: { $nin: ['RESOLVED','CLOSED','REJECTED'] } }).limit(200).sort({ createdAt:-1 });
    const dups = findDuplicates({ title, description, category: analysis.category, location, createdAt: new Date() }, existingForDup);

    const historical = await Issue.find({ organizationId, category: analysis.category }).limit(100);
    const recurrence = detectRecurrence(historical, analysis.category, location?.building);

    const priority = calculatePriority({ severity: analysis.severity, affectedUsers: analysis.affectedUsers, recurrenceScore: recurrence.score, urgency: assignedUrgency, sentimentScore: analysis.sentimentScore, voteCount:0 });
    const slaDeadlines = getSLADeadlines(priority.level);

    const issueData = {
      organizationId,
      campusId: finalCampusId,
      departmentId: dept?._id,
      reportedBy: anonymous? null : req.user._id,
      anonymous: !!anonymous,
      title, description,
      category: analysis.category,
      subcategory: analysis.subcategory,
      location,
      severity: analysis.severity,
      urgency: assignedUrgency,
      impact: impact||'Few students',
      affectedUsers: analysis.affectedUsers,
      sentiment: analysis.sentiment,
      sentimentScore: analysis.sentimentScore,
      priorityScore: priority.score,
      priorityLevel: priority.level,
      priorityExplanation: priority.reasons,
      status: 'TRIAGED',
      assignedDepartment: dept?._id,
      recurrenceScore: recurrence.score,
      isRecurring: recurrence.isRecurring,
      duplicateScore: dups.length? dups[0].score : 0,
      isDuplicate: dups.length && dups[0].score>=0.85,
      duplicateOf: dups.length && dups[0].score>=0.85 ? dups[0].issue._id : null,
      relatedIssues: dups.filter(d=>d.isRelated||d.isLikely).map(d=>d.issue._id),
      aiAnalysis: { mode: analysis.mode, category: analysis.category, subcategory: analysis.subcategory, severity: analysis.severity, urgency: assignedUrgency, affectedUsers: analysis.affectedUsers, department: analysis.department, sentiment: analysis.sentiment, summary: analysis.summary, keywords: analysis.keywords, duplicateProbability: dups.length?dups[0].score:0, recurrenceDetected: recurrence.isRecurring, confidence: analysis.confidence },
      sla: { responseDeadline: slaDeadlines.responseDeadline, resolutionDeadline: slaDeadlines.resolutionDeadline, status: 'ON_TRACK' },
      activityTimeline: [{ action: 'Reported', by: req.user._id, timestamp: new Date() }, { action: 'AI Triaged', timestamp: new Date(), metadata: { priority: priority.score, category: analysis.category } }]
    };

    // handle images if uploaded via multer
    if (req.files && req.files.length) {
      issueData.images = req.files.map(f=> ({ url: `/uploads/${f.filename}`, publicId: f.filename }));
    }

    const issue = await Issue.create(issueData);

    // Cluster
    const cluster = await createOrUpdateCluster(issue, dups);

    // Update issue with cluster
    issue.clusterId = cluster._id;
    await issue.save();

    // Notifications to campus admins and dept admins
    const admins = await User.find({ organizationId, role: { $in: ['CAMPUS_ADMIN','DEPARTMENT_ADMIN'] }, isActive: true });
    for (const admin of admins) {
      await createNotification({ organizationId, recipient: admin._id, type: priority.level==='CRITICAL'?'CRITICAL_ALERT':'ISSUE_CREATED', title: `${priority.level} Issue: ${issue.title}`, message: `New ${issue.category} issue reported in ${issue.location?.building||'campus'} with priority ${issue.priorityScore}`, issueId: issue._id, priority: priority.level });
    }

    await ActivityLog.create({ organizationId, user: req.user._id, action: 'ISSUE_CREATED', entity: 'Issue', entityId: issue._id, metadata: { priority: priority.score } });

    const io = getIO();
    if (io) {
      io.to(`org:${organizationId}`).emit('issue.created', issue);
      if (priority.level==='CRITICAL') io.to(`org:${organizationId}`).emit('notification.created', { type: 'CRITICAL_ALERT', issue });
    }

    res.status(201).json({ success:true, data: issue });
  } catch (e) { console.error(e); res.status(500).json({ success:false, message: e.message }); }
};

export const getIssues = async (req, res) => {
  try {
    const { page=1, limit=20, search, category, status, priority, department, building, sortBy='createdAt', sortOrder='desc', sla, anonymous, recurring, duplicate, dateFrom, dateTo, campusId } = req.query;

    if (mongoose.connection.readyState !== 1) {
      const result = memoryStore.getIssues({
        page, limit, search, category, status,
        priorityLevel: priority, department, building,
        sort: sortBy === 'priorityScore' ? 'priority' : sortBy === 'voteCount' ? 'votes' : 'date',
        reportedBy: req.query.myIssues === 'true' ? req.user._id : undefined,
        isRecurring: recurring === 'true' ? true : undefined
      });
      return res.json({ success: true, data: result.issues, pagination: result.pagination });
    }

    const filter = { organizationId: req.user.organizationId };
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priorityLevel = priority;
    if (department) filter.assignedDepartment = department;
    if (building) filter['location.building'] = building;
    if (sla) filter['sla.status'] = sla;
    if (anonymous==='true') filter.anonymous = true;
    if (recurring==='true') filter.isRecurring = true;
    if (duplicate==='true') filter.isDuplicate = true;
    if (campusId) filter.campusId = campusId;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const sort = {};
    if (search) sort.score = { $meta: 'textScore' };
    else sort[sortBy] = sortOrder==='asc'?1:-1;

    const skip = (parseInt(page)-1)*parseInt(limit);
    const [issues, total] = await Promise.all([
      Issue.find(filter).populate('assignedDepartment reportedBy assignedTo').sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Issue.countDocuments(filter)
    ]);

    res.json({ success:true, data: issues, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total/parseInt(limit)) } });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const getIssueById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const issue = memoryStore.getIssueById(req.params.id);
      if (!issue) return res.status(404).json({ success:false, message:'Issue not found' });
      return res.json({ success:true, data: { issue, comments: issue.comments || [] } });
    }
    const issue = await Issue.findOne({ _id: req.params.id, organizationId: req.user.organizationId }).populate('assignedDepartment reportedBy assignedTo relatedIssues duplicateOf clusterId');
    if (!issue) return res.status(404).json({ success:false, message:'Issue not found' });
    const comments = await (await import('../models/Comment.js')).default.find({ issueId: issue._id }).populate('author').sort({ createdAt:1 });
    res.json({ success:true, data: { issue, comments } });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const updateIssue = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const issue = memoryStore.updateIssue(req.params.id, req.body);
      if (!issue) return res.status(404).json({ success:false, message:'Not found' });
      return res.json({ success:true, data: issue });
    }
    const issue = await Issue.findOneAndUpdate({ _id: req.params.id, organizationId: req.user.organizationId }, req.body, { new:true });
    if (!issue) return res.status(404).json({ success:false, message:'Not found' });
    const io = getIO(); if (io) io.to(`org:${issue.organizationId}`).emit('issue.updated', issue);
    res.json({ success:true, data: issue });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const deleteIssue = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryStore.issues.findIndex(i => i._id === req.params.id || i.id === req.params.id);
      if (idx !== -1) memoryStore.issues.splice(idx, 1);
      return res.json({ success:true, message:'Deleted' });
    }
    const issue = await Issue.findOneAndDelete({ _id: req.params.id, organizationId: req.user.organizationId });
    if (!issue) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, message:'Deleted' });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const updateStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const issue = memoryStore.updateIssue(req.params.id, {
        status,
        sla: {
          ...((memoryStore.getIssueById(req.params.id) || {}).sla || {}),
          status: status === 'RESOLVED' ? 'COMPLETED' : 'ON_TRACK',
          resolvedAt: status === 'RESOLVED' ? new Date() : null
        }
      });
      if (!issue) return res.status(404).json({ success:false, message:'Not found' });
      const io = getIO();
      if (io) io.to(`org:${req.user.organizationId}`).emit('issue.statusChanged', { issueId: issue._id, status });
      return res.json({ success:true, data: issue });
    }

    const issue = await Issue.findOne({ _id: req.params.id, organizationId: req.user.organizationId });
    if (!issue) return res.status(404).json({ success:false, message:'Not found' });
    const prev = issue.status;
    issue.status = status;
    if (status==='RESOLVED') { issue.sla.resolvedAt = new Date(); issue.sla.status='COMPLETED'; }
    if (status==='ASSIGNED' && !issue.sla.respondedAt) issue.sla.respondedAt = new Date();
    issue.activityTimeline.push({ action: `Status changed ${prev} -> ${status}`, by: req.user._id, timestamp: new Date(), metadata: { comment } });
    await issue.save();

    await ActivityLog.create({ organizationId: issue.organizationId, user: req.user._id, action: 'STATUS_CHANGED', entity: 'Issue', entityId: issue._id, metadata: { from: prev, to: status } });

    const io = getIO();
    if (io) {
      io.to(`org:${issue.organizationId}`).emit('issue.statusChanged', { issueId: issue._id, status, prev });
      if (status==='RESOLVED') io.to(`org:${issue.organizationId}`).emit('issue.resolved', issue);
    }

    if (issue.reportedBy) {
      await createNotification({ organizationId: issue.organizationId, recipient: issue.reportedBy, type: 'ISSUE_STATUS_CHANGED', title: `Issue ${status}`, message: `Your issue "${issue.title}" is now ${status}`, issueId: issue._id });
    }

    res.json({ success:true, data: issue });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const assignIssue = async (req, res) => {
  try {
    const { assignedTo, assignedDepartment } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const dept = memoryStore.departments.find(d => d._id === assignedDepartment) || memoryStore.departments[0];
      const issue = memoryStore.updateIssue(req.params.id, {
        status: 'ASSIGNED',
        assignedDepartment: dept,
        departmentId: dept?._id,
        assignedTo
      });
      if (!issue) return res.status(404).json({ success:false, message:'Not found' });
      return res.json({ success:true, data: issue });
    }

    const issue = await Issue.findOne({ _id: req.params.id, organizationId: req.user.organizationId });
    if (!issue) return res.status(404).json({ success:false, message:'Not found' });
    if (assignedTo) issue.assignedTo = assignedTo;
    if (assignedDepartment) { issue.assignedDepartment = assignedDepartment; issue.departmentId = assignedDepartment; }
    issue.status = 'ASSIGNED';
    issue.activityTimeline.push({ action: 'Assigned', by: req.user._id, timestamp: new Date(), metadata: { assignedTo, assignedDepartment } });
    await issue.save();
    const io = getIO(); if (io) io.to(`org:${issue.organizationId}`).emit('issue.assigned', issue);
    res.json({ success:true, data: issue });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const voteIssue = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const voteRes = memoryStore.voteIssue(req.params.id, req.user._id);
      if (!voteRes) return res.status(404).json({ success:false, message:'Not found' });
      return res.json({ success:true, data: { voted: voteRes.voted, voteCount: voteRes.issue.voteCount, affectedUsers: voteRes.issue.affectedUsers } });
    }

    const issue = await Issue.findOne({ _id: req.params.id, organizationId: req.user.organizationId });
    if (!issue) return res.status(404).json({ success:false, message:'Not found' });
    const userId = req.user._id;
    const hasVoted = issue.votes.some(v=> v.toString()===userId.toString());
    if (hasVoted) {
      issue.votes = issue.votes.filter(v=> v.toString()!==userId.toString());
      issue.voteCount = Math.max(0, issue.voteCount-1);
      issue.affectedUsers = Math.max(1, issue.affectedUsers-1);
    } else {
      issue.votes.push(userId);
      issue.voteCount +=1;
      issue.affectedUsers +=1;
    }
    await issue.save();
    // recalc priority slightly
    const { calculatePriority } = await import('../services/priority/priority.service.js');
    const pri = calculatePriority({ severity: issue.severity, affectedUsers: issue.affectedUsers, recurrenceScore: issue.recurrenceScore, urgency: issue.urgency, sentimentScore: issue.sentimentScore, voteCount: issue.voteCount });
    issue.priorityScore = pri.score; issue.priorityLevel = pri.level; await issue.save();
    res.json({ success:true, data: { voted: !hasVoted, voteCount: issue.voteCount, affectedUsers: issue.affectedUsers } });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const followIssue = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const followRes = memoryStore.followIssue(req.params.id, req.user._id);
      if (!followRes) return res.status(404).json({ success:false, message:'Not found' });
      return res.json({ success:true, data: { following: followRes.following } });
    }

    const issue = await Issue.findOne({ _id: req.params.id, organizationId: req.user.organizationId });
    if (!issue) return res.status(404).json({ success:false, message:'Not found' });
    const uid = req.user._id;
    const isFollowing = issue.followers.some(f=> f.toString()===uid.toString());
    if (isFollowing) issue.followers = issue.followers.filter(f=> f.toString()!==uid.toString());
    else issue.followers.push(uid);
    await issue.save();
    res.json({ success:true, data: { following: !isFollowing } });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const confirmResolution = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const issue = memoryStore.updateIssue(req.params.id, { status: 'CLOSED', 'resolution.confirmedByReporter': true });
      if (!issue) return res.status(404).json({ success:false, message:'Not found' });
      return res.json({ success:true, data: issue });
    }

    const issue = await Issue.findOne({ _id: req.params.id, organizationId: req.user.organizationId });
    if (!issue) return res.status(404).json({ success:false, message:'Not found' });
    issue.resolution.confirmedByReporter = true;
    issue.status = 'CLOSED';
    issue.activityTimeline.push({ action: 'Resolution confirmed by reporter', by: req.user._id, timestamp: new Date() });
    await issue.save();
    res.json({ success:true, data: issue });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

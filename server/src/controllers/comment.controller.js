import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Issue from '../models/Issue.js';
import { getIO } from '../sockets/socket.js';
import { createNotification } from '../services/notification.service.js';
import { memoryStore } from '../services/memoryStore.js';

export const createComment = async (req, res) => {
  try {
    const { content, isInternal } = req.body;
    const issueId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      const comment = memoryStore.addComment(issueId, {
        author: { _id: req.user._id, name: req.user.name, role: req.user.role },
        content,
        isInternal: !!isInternal
      });
      const io = getIO();
      if (io) io.to(`org:${req.user.organizationId}`).emit('issue.commentAdded', { issueId, comment });
      return res.status(201).json({ success: true, data: comment });
    }

    const issue = await Issue.findOne({ _id: issueId, organizationId: req.user.organizationId });
    if (!issue) return res.status(404).json({ success:false, message:'Issue not found' });
    const comment = await Comment.create({ organizationId: issue.organizationId, campusId: issue.campusId, issueId, author: req.user._id, content, isInternal: !!isInternal });
    await comment.populate('author');
    const io = getIO();
    if (io) io.to(`org:${issue.organizationId}`).emit('issue.commentAdded', { issueId, comment });
    // notify followers and reporter
    const recipients = [...new Set([...(issue.followers||[]).map(id=>id.toString()), issue.reportedBy?.toString()].filter(Boolean))].filter(id=> id!==req.user._id.toString());
    for (const rec of recipients) {
      await createNotification({ organizationId: issue.organizationId, recipient: rec, type: 'ISSUE_COMMENTED', title: 'New comment on followed issue', message: `${req.user.name} commented: ${content.substring(0,80)}`, issueId });
    }
    res.status(201).json({ success:true, data: comment });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const getComments = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const issue = memoryStore.getIssueById(req.params.id);
      return res.json({ success: true, data: issue ? issue.comments : [] });
    }
    const comments = await Comment.find({ issueId: req.params.id, organizationId: req.user.organizationId }).populate('author').sort({ createdAt:1 });
    res.json({ success:true, data: comments });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const editComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.commentId, author: req.user._id });
    if (!comment) return res.status(404).json({ success:false, message:'Not found or not owner' });
    comment.content = req.body.content; comment.isEdited=true; await comment.save();
    res.json({ success:true, data: comment });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.commentId, author: req.user._id });
    if (!comment) return res.status(404).json({ success:false, message:'Not found' });
    await comment.deleteOne();
    res.json({ success:true, message:'Deleted' });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

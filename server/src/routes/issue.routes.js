import express from 'express';
import { protect, optionalAuth } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenant.js';
import { createIssue, getIssues, getIssueById, updateIssue, deleteIssue, updateStatus, assignIssue, voteIssue, followIssue, confirmResolution, analyzePreview } from '../controllers/issue.controller.js';
import { createComment, getComments, editComment, deleteComment } from '../controllers/comment.controller.js';
import multer from 'multer';
const router = express.Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5*1024*1024 } });

// Publicly readable endpoints with tenant fallback
router.get('/', optionalAuth, tenantIsolation, getIssues);
router.get('/:id', optionalAuth, tenantIsolation, getIssueById);
router.get('/:id/comments', optionalAuth, tenantIsolation, getComments);

// Authenticated endpoints
router.use(protect, tenantIsolation);
router.post('/analyze-preview', analyzePreview);
router.post('/', upload.array('images', 5), createIssue);
router.route('/:id').put(updateIssue).delete(deleteIssue);
router.patch('/:id/status', updateStatus);
router.patch('/:id/assign', assignIssue);
router.post('/:id/vote', voteIssue);
router.post('/:id/follow', followIssue);
router.post('/:id/confirm', confirmResolution);
router.post('/:id/comments', createComment);
router.put('/:id/comments/:commentId', editComment);
router.delete('/:id/comments/:commentId', deleteComment);

export default router;


import express from 'express';
import issueRoutes from './issue.routes.js';
import { getAIModeLabel } from '../services/ai/ai.service.js';

const router = express.Router();

router.use('/issues', issueRoutes);

// Auth endpoints
router.post('/auth/login', (req, res) => {
  const { email } = req.body;
  const role = (email && email.includes('admin')) ? 'CAMPUS_ADMIN' : ((email && email.includes('dept')) ? 'DEPARTMENT_ADMIN' : 'STUDENT');
  res.json({
    success: true,
    token: 'jwt-auth-token-' + Date.now(),
    user: {
      name: email ? email.split('@')[0].toUpperCase() : 'Student Member',
      email: email || 'student@campuspulse.demo',
      role,
      department: 'Campus Community'
    }
  });
});

router.post('/auth/register', (req, res) => {
  res.json({
    success: true,
    token: 'jwt-auth-token-' + Date.now(),
    user: req.body
  });
});

// Admin stats
router.get('/admin/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalIssues: 46,
      activeIssues: 12,
      criticalIssues: 2,
      inProgress: 5,
      resolved: 34,
      healthScore: 94.8,
      slaCompliance: 92.4,
      avgResolutionHours: 3.8
    }
  });
});

router.get('/admin/ai-mode', (req, res) => {
  res.json({ success: true, mode: getAIModeLabel() });
});

export default router;

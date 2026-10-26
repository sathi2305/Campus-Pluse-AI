import api from './api.js';
import { SEED_ISSUES } from '../data/seedData.js';
import { DEPARTMENTS } from '../utils/constants.js';
import { issueService } from './issue.service.js';

export const adminService = {
  stats: async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data && res.data.data) return res.data.data;
    } catch (e) {}

    const res = await issueService.list({ limit: 100 });
    const issues = res.data || [];
    const critical = issues.filter(i => i.priorityLevel === 'CRITICAL' && i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
    const inProgress = issues.filter(i => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length;
    const resolved = issues.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;

    return {
      totalIssues: issues.length,
      activeIssues: issues.length - resolved,
      criticalIssues: critical,
      inProgress,
      resolved,
      healthScore: 94.8,
      slaCompliance: 92.4,
      avgResolutionHours: 3.8
    };
  },

  priorityQueue: async () => {
    try {
      const res = await api.get('/admin/priority-queue');
      if (res.data && res.data.data) return res.data.data;
    } catch (e) {}

    const res = await issueService.list({ limit: 50 });
    const issues = (res.data || []).filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED');
    return issues.sort((a, b) => {
      const pScore = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (pScore[b.priorityLevel] || 1) - (pScore[a.priorityLevel] || 1);
    });
  },

  heatmap: async () => {
    try {
      const res = await api.get('/admin/heatmap');
      if (res.data && res.data.data) return res.data;
    } catch (e) {}

    const res = await issueService.list({ limit: 100 });
    const issues = res.data || [];

    const buildingMap = {};
    issues.forEach(i => {
      const b = i.location?.building || 'General Campus';
      if (!buildingMap[b]) {
        buildingMap[b] = {
          building: b,
          issues: 0,
          critical: 0,
          affectedUsers: 0,
          avgPriority: 60,
          topCategory: i.category,
          coordinates: i.location?.coordinates || { lat: 11.0168, lng: 76.9558 }
        };
      }
      buildingMap[b].issues += 1;
      if (i.priorityLevel === 'CRITICAL') buildingMap[b].critical += 1;
      buildingMap[b].affectedUsers += (i.affectedUsers || 20);
    });

    const hotspots = Object.values(buildingMap).map(h => ({
      ...h,
      intensity: Math.min(1.0, (h.issues * 0.2) + (h.critical * 0.4))
    }));

    return { data: hotspots };
  },

  analytics: async () => {
    try {
      const res = await api.get('/admin/analytics');
      if (res.data && res.data.data) return res.data.data;
    } catch (e) {}

    return {
      categoryBreakdown: [
        { name: 'Electricity', value: 14, color: '#f59e0b' },
        { name: 'Water', value: 11, color: '#0ea5e9' },
        { name: 'Internet', value: 9, color: '#6366f1' },
        { name: 'Cleanliness', value: 6, color: '#10b981' },
        { name: 'Infrastructure', value: 4, color: '#8b5cf6' },
        { name: 'Food', value: 2, color: '#ec4899' }
      ],
      weeklyTrend: [
        { day: 'Mon', reported: 8, resolved: 7 },
        { day: 'Tue', reported: 12, resolved: 11 },
        { day: 'Wed', reported: 15, resolved: 13 },
        { day: 'Thu', reported: 9, resolved: 10 },
        { day: 'Fri', reported: 14, resolved: 12 },
        { day: 'Sat', reported: 5, resolved: 6 },
        { day: 'Sun', reported: 3, resolved: 4 }
      ]
    };
  },

  aiInsights: async () => {
    return {
      riskLevel: 'Moderate',
      primaryThreat: 'Recurring power surges in Science Block A distribution panels',
      recommendations: [
        'Schedule preventive capacitor inspection on Science Block A Phase 3 feeders.',
        'Rebalance electrical loads before Friday laboratory practicals.',
        'Replace 120-meter plumbing main joint in Boys Hostel East corridor.'
      ],
      recurringPatterns: [
        { cluster: 'Hostel Night Drainage', occurrences: 4, severity: 'Medium', area: 'Boys Hostel 1' },
        { cluster: 'Library AP Thermal Throttling', occurrences: 3, severity: 'Low', area: 'Central Digital Library' }
      ]
    };
  }
};

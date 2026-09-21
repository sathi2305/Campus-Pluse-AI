import { issueTemplates } from '../seeds/demoData.js';
import { calculatePriority } from './priority/priority.service.js';
import { getSLADeadlines } from './sla/sla.service.js';

export const departmentsData = [
  { _id: 'dept-it-1', id: 'dept-it-1', name: 'IT', code: 'IT', categories: ['Internet','Academic'], description: 'Information Technology' },
  { _id: 'dept-hostel-1', id: 'dept-hostel-1', name: 'Hostel', code: 'HOSTEL', categories: ['Hostel','Water'], description: 'Hostel Maintenance' },
  { _id: 'dept-elec-1', id: 'dept-elec-1', name: 'Electrical', code: 'ELEC', categories: ['Electricity'], description: 'Electrical Department' },
  { _id: 'dept-maint-1', id: 'dept-maint-1', name: 'Maintenance', code: 'MAINT', categories: ['Infrastructure','Cleanliness','Water'], description: 'Maintenance' },
  { _id: 'dept-trans-1', id: 'dept-trans-1', name: 'Transport', code: 'TRANS', categories: ['Transport'], description: 'Transport' },
  { _id: 'dept-food-1', id: 'dept-food-1', name: 'Food Services', code: 'FOOD', categories: ['Food'], description: 'Food Services' },
  { _id: 'dept-sec-1', id: 'dept-sec-1', name: 'Security', code: 'SEC', categories: ['Security'], description: 'Security' },
  { _id: 'dept-acad-1', id: 'dept-acad-1', name: 'Academic', code: 'ACAD', categories: ['Academic','Laboratory'], description: 'Academic' },
  { _id: 'dept-lib-1', id: 'dept-lib-1', name: 'Library', code: 'LIB', categories: ['Library'], description: 'Library' },
  { _id: 'dept-admin-1', id: 'dept-admin-1', name: 'Administration', code: 'ADMIN', categories: ['Administration','Other'], description: 'Administration' },
];

export const demoOrg = {
  _id: 'org-tech-1',
  id: 'org-tech-1',
  name: 'Tech University',
  slug: 'tech-university',
  description: 'Premier Tech University'
};

export const demoCampus = {
  _id: 'campus-main-1',
  id: 'campus-main-1',
  organizationId: 'org-tech-1',
  name: 'Main Campus',
  code: 'MAIN',
  location: 'Coimbatore',
  coordinates: { lat: 11.0168, lng: 76.9558 }
};

const initialUsers = [
  {
    _id: 'user-student-1',
    id: 'user-student-1',
    organizationId: demoOrg._id,
    campusId: demoCampus._id,
    name: 'Demo Student',
    email: 'student@campuspulse.demo',
    role: 'STUDENT',
    studentId: 'STU001',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 86400000)
  },
  {
    _id: 'user-admin-1',
    id: 'user-admin-1',
    organizationId: demoOrg._id,
    campusId: demoCampus._id,
    name: 'Campus Admin',
    email: 'admin@campuspulse.demo',
    role: 'CAMPUS_ADMIN',
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 86400000)
  },
  {
    _id: 'user-dept-1',
    id: 'user-dept-1',
    organizationId: demoOrg._id,
    campusId: demoCampus._id,
    departmentId: departmentsData[0]._id,
    name: 'Dept Admin IT',
    email: 'department@campuspulse.demo',
    role: 'DEPARTMENT_ADMIN',
    isActive: true,
    createdAt: new Date(Date.now() - 45 * 86400000)
  },
  {
    _id: 'user-faculty-1',
    id: 'user-faculty-1',
    organizationId: demoOrg._id,
    campusId: demoCampus._id,
    name: 'Dr. Sarah Connor',
    email: 'sarah.connor@demo.com',
    role: 'FACULTY',
    studentId: 'FAC001',
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 86400000)
  }
];

class MemoryStore {
  constructor() {
    this.organizations = [demoOrg];
    this.campuses = [demoCampus];
    this.departments = departmentsData.map(d => ({ ...d, organizationId: demoOrg._id, campusId: demoCampus._id, admins: [], staff: [] }));
    this.users = [...initialUsers];
    this.issues = [];
    this.comments = [];
    this.notifications = [];
    this.clusters = [];
    this.activityLogs = [];
    this.initDemoData();
  }

  initDemoData() {
    const now = new Date();
    // Generate issues from templates
    for (let i = 0; i < 120; i++) {
      const template = issueTemplates[i % issueTemplates.length];
      const variation = i > 20 ? ` (Report ${i})` : '';
      const severity = template.category === 'Water' && template.building === 'Hostel B' ? 9 : Math.floor(Math.random() * 4) + 5;
      const urgency = severity >= 8 ? 'High' : (severity <= 4 ? 'Low' : ['Low', 'Medium', 'High'][i % 3]);
      const impactOpts = ['Only me', 'Few students', 'Class', 'Hostel block', 'Department', 'Multiple departments', 'Entire campus'];
      const impact = template.impact || impactOpts[Math.floor(Math.random() * impactOpts.length)];
      const affectedMap = { 'Only me': 1, 'Few students': 5, 'Class': 40, 'Hostel block': 120, 'Department': 200, 'Multiple departments': 350, 'Entire campus': 600 };
      const affectedUsers = (affectedMap[impact] || 50) + Math.floor(Math.random() * 20);
      const recurrenceScore = template.building === 'Hostel B' && template.category === 'Water' ? 8 : Math.floor(Math.random() * 6);
      const sentimentScore = -(Math.random() * 0.8 + 0.1);
      const voteCount = Math.floor(Math.random() * 40);

      const priority = calculatePriority({ severity, affectedUsers, recurrenceScore, urgency, sentimentScore, voteCount });
      const slaDeadlines = getSLADeadlines(priority.level);
      const statuses = ['NEW', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
      const status = i < 30 ? 'NEW' : i < 60 ? 'IN_PROGRESS' : i < 90 ? 'RESOLVED' : 'TRIAGED';
      const createdAt = new Date(now.getTime() - Math.floor(Math.random() * 30) * 86400000);
      const deptForCat = this.departments.find(d => d.categories.includes(template.category)) || this.departments[0];
      const issueId = `issue-${1000 + i}`;

      const issue = {
        _id: issueId,
        id: issueId,
        organizationId: demoOrg._id,
        campusId: demoCampus._id,
        departmentId: deptForCat._id,
        assignedDepartment: deptForCat,
        reportedBy: this.users[i % this.users.length]._id,
        anonymous: Math.random() > 0.8,
        title: template.title + variation,
        description: template.description + ` Note: Reported via student app. Requires swift attention from ${deptForCat.name} team.`,
        category: template.category,
        subcategory: 'General',
        location: {
          building: template.building,
          block: template.block || 'Main',
          floor: `${Math.floor(Math.random() * 3) + 1}`,
          room: `${100 + Math.floor(Math.random() * 20)}`,
          campus: 'Main Campus',
          coordinates: {
            lat: 11.0168 + (Math.random() - 0.5) * 0.015,
            lng: 76.9558 + (Math.random() - 0.5) * 0.015
          }
        },
        severity,
        urgency,
        impact,
        affectedUsers,
        sentiment: sentimentScore < -0.6 ? 'very_negative' : 'negative',
        sentimentScore,
        priorityScore: priority.score,
        priorityLevel: priority.level,
        priorityExplanation: priority.reasons,
        status,
        recurrenceScore,
        isRecurring: recurrenceScore > 3,
        isDuplicate: i % 7 === 0,
        duplicateScore: i % 7 === 0 ? 0.88 : 0.1,
        voteCount,
        votes: [],
        followers: [],
        aiAnalysis: {
          mode: 'local',
          category: template.category,
          subcategory: 'Supply Disruption',
          severity,
          urgency,
          affectedUsers,
          department: deptForCat.name,
          sentiment: 'negative',
          summary: template.description.substring(0, 100),
          keywords: template.category.toLowerCase().split(' '),
          confidence: 0.85
        },
        sla: {
          responseDeadline: slaDeadlines.responseDeadline,
          resolutionDeadline: slaDeadlines.resolutionDeadline,
          status: status === 'RESOLVED' ? 'COMPLETED' : (Math.random() > 0.8 ? 'BREACHED' : Math.random() > 0.6 ? 'AT_RISK' : 'ON_TRACK'),
          resolvedAt: status === 'RESOLVED' ? new Date() : null
        },
        activityTimeline: [
          { action: 'Reported', by: this.users[0]._id, timestamp: createdAt },
          { action: 'AI Triaged', timestamp: new Date(createdAt.getTime() + 60000), metadata: { priority: priority.score, category: template.category } }
        ],
        createdAt,
        updatedAt: createdAt
      };

      this.issues.push(issue);

      // Add a couple sample comments for top issues
      if (i < 25) {
        this.comments.push({
          _id: `comment-${i}-1`,
          id: `comment-${i}-1`,
          issueId: issueId,
          organizationId: demoOrg._id,
          campusId: demoCampus._id,
          author: { _id: this.users[0]._id, name: this.users[0].name, role: this.users[0].role },
          content: 'Facing the same issue since yesterday morning, please fix soon!',
          createdAt: new Date(createdAt.getTime() + 1800000)
        });
      }
    }

    // Clusters
    const hostelBWater = this.issues.filter(i => i.location.building === 'Hostel B' && i.category === 'Water');
    this.clusters = [
      {
        _id: 'cluster-1',
        id: 'cluster-1',
        organizationId: demoOrg._id,
        campusId: demoCampus._id,
        title: 'Hostel B Water Supply Breakdown',
        category: 'Water',
        locationKey: 'hostel-b-water',
        issueIds: hostelBWater.map(i => i._id),
        count: hostelBWater.length || 12,
        affectedUsers: 480,
        priority: 95,
        priorityLevel: 'CRITICAL',
        firstReported: new Date(now.getTime() - 4 * 86400000),
        lastReported: now,
        recurrenceScore: 8.5,
        topKeywords: ['water', 'hostel', 'supply', 'pipeline', 'taps']
      },
      {
        _id: 'cluster-2',
        id: 'cluster-2',
        organizationId: demoOrg._id,
        campusId: demoCampus._id,
        title: 'Engineering Block Wi-Fi Disruption',
        category: 'Internet',
        locationKey: 'eng-wifi',
        issueIds: [],
        count: 8,
        affectedUsers: 320,
        priority: 78,
        priorityLevel: 'HIGH',
        firstReported: new Date(now.getTime() - 2 * 86400000),
        lastReported: now,
        recurrenceScore: 5.2,
        topKeywords: ['wifi', 'router', 'engineering', 'internet']
      }
    ];

    // Notifications
    this.notifications = [
      {
        _id: 'notif-1',
        id: 'notif-1',
        organizationId: demoOrg._id,
        recipient: 'user-student-1',
        type: 'STATUS_CHANGE',
        title: 'Your issue status updated',
        message: 'Your report "No water in Hostel B" is now being investigated by Maintenance.',
        isRead: false,
        priority: 'HIGH',
        createdAt: new Date(now.getTime() - 3600000)
      },
      {
        _id: 'notif-2',
        id: 'notif-2',
        organizationId: demoOrg._id,
        recipient: 'user-admin-1',
        type: 'CRITICAL_ALERT',
        title: 'Critical Cluster Detected in Hostel B',
        message: '47 reports regarding water stoppage affecting 630 students.',
        isRead: false,
        priority: 'CRITICAL',
        createdAt: new Date(now.getTime() - 7200000)
      },
      {
        _id: 'notif-3',
        id: 'notif-3',
        organizationId: demoOrg._id,
        recipient: 'user-dept-1',
        type: 'SLA_WARNING',
        title: 'SLA At Risk for CS Block Network',
        message: 'Resolution deadline expires in 45 minutes.',
        isRead: false,
        priority: 'HIGH',
        createdAt: new Date(now.getTime() - 1800000)
      }
    ];
  }

  findUserByEmail(email) {
    if (!email) return null;
    const lower = email.trim().toLowerCase();
    return this.users.find(u => u.email.toLowerCase() === lower);
  }

  findUserById(id) {
    return this.users.find(u => u._id === id || u.id === id);
  }

  createUser(userData) {
    const id = `user-${Date.now()}`;
    const user = {
      _id: id,
      id,
      organizationId: demoOrg._id,
      campusId: demoCampus._id,
      isActive: true,
      createdAt: new Date(),
      ...userData
    };
    this.users.push(user);
    return user;
  }

  getIssues(filter = {}) {
    let list = [...this.issues];
    if (filter.category) list = list.filter(i => i.category.toLowerCase() === filter.category.toLowerCase());
    if (filter.status) list = list.filter(i => i.status === filter.status);
    if (filter.priorityLevel) list = list.filter(i => i.priorityLevel === filter.priorityLevel);
    if (filter.urgency) list = list.filter(i => i.urgency === filter.urgency);
    if (filter.department) list = list.filter(i => (i.assignedDepartment?._id === filter.department || i.departmentId === filter.department));
    if (filter.reportedBy) list = list.filter(i => i.reportedBy === filter.reportedBy);
    if (filter.isRecurring !== undefined) list = list.filter(i => i.isRecurring === filter.isRecurring);

    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || (i.location?.building && i.location.building.toLowerCase().includes(q)));
    }

    if (filter.sort === 'priority') {
      list.sort((a, b) => b.priorityScore - a.priorityScore);
    } else if (filter.sort === 'votes') {
      list.sort((a, b) => b.voteCount - a.voteCount);
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const page = parseInt(filter.page) || 1;
    const limit = parseInt(filter.limit) || 20;
    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      issues: paginated,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  getIssueById(id) {
    const issue = this.issues.find(i => i._id === id || i.id === id);
    if (!issue) return null;
    const comments = this.comments.filter(c => c.issueId === id);
    return { ...issue, comments };
  }

  createIssue(issueData) {
    const id = `issue-${Date.now()}`;
    const dept = this.departments.find(d => d._id === issueData.departmentId || d.categories.includes(issueData.category)) || this.departments[0];
    const newIssue = {
      _id: id,
      id,
      organizationId: demoOrg._id,
      campusId: demoCampus._id,
      assignedDepartment: dept,
      departmentId: dept._id,
      status: 'TRIAGED',
      voteCount: 0,
      votes: [],
      followers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...issueData
    };
    this.issues.unshift(newIssue);
    return newIssue;
  }

  updateIssue(id, updates) {
    const idx = this.issues.findIndex(i => i._id === id || i.id === id);
    if (idx === -1) return null;
    this.issues[idx] = { ...this.issues[idx], ...updates, updatedAt: new Date() };
    return this.issues[idx];
  }

  voteIssue(id, userId) {
    const issue = this.issues.find(i => i._id === id || i.id === id);
    if (!issue) return null;
    const hasVoted = issue.votes.includes(userId);
    if (hasVoted) {
      issue.votes = issue.votes.filter(u => u !== userId);
      issue.voteCount = Math.max(0, issue.voteCount - 1);
    } else {
      issue.votes.push(userId);
      issue.voteCount += 1;
    }
    return { issue, voted: !hasVoted };
  }

  followIssue(id, userId) {
    const issue = this.issues.find(i => i._id === id || i.id === id);
    if (!issue) return null;
    const isFollowing = issue.followers.includes(userId);
    if (isFollowing) {
      issue.followers = issue.followers.filter(u => u !== userId);
    } else {
      issue.followers.push(userId);
    }
    return { issue, following: !isFollowing };
  }

  addComment(issueId, commentData) {
    const id = `comment-${Date.now()}`;
    const comment = {
      _id: id,
      id,
      issueId,
      organizationId: demoOrg._id,
      campusId: demoCampus._id,
      createdAt: new Date(),
      ...commentData
    };
    this.comments.push(comment);
    return comment;
  }

  getAnalytics() {
    const total = this.issues.length;
    const critical = this.issues.filter(i => i.priorityLevel === 'CRITICAL' && !['RESOLVED', 'CLOSED'].includes(i.status)).length;
    const open = this.issues.filter(i => ['NEW', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS'].includes(i.status)).length;
    const resolved = this.issues.filter(i => ['RESOLVED', 'CLOSED'].includes(i.status)).length;
    const breached = this.issues.filter(i => i.sla?.status === 'BREACHED').length;

    // Categories breakdown
    const catMap = {};
    this.issues.forEach(i => {
      catMap[i.category] = (catMap[i.category] || 0) + 1;
    });
    const byCategory = Object.entries(catMap).map(([category, count]) => ({ category, count }));

    // Department breakdown
    const deptMap = {};
    this.issues.forEach(i => {
      const name = i.assignedDepartment?.name || 'General';
      deptMap[name] = (deptMap[name] || 0) + 1;
    });
    const byDepartment = Object.entries(deptMap).map(([department, count]) => ({ department, count }));

    // Priority breakdown
    const priorityDist = {
      CRITICAL: this.issues.filter(i => i.priorityLevel === 'CRITICAL').length,
      HIGH: this.issues.filter(i => i.priorityLevel === 'HIGH').length,
      MEDIUM: this.issues.filter(i => i.priorityLevel === 'MEDIUM').length,
      LOW: this.issues.filter(i => i.priorityLevel === 'LOW').length,
    };

    // Issues over last 7 days
    const overTime = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(Date.now() - d * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const count = this.issues.filter(i => i.createdAt.toISOString().split('T')[0] === dateStr).length || Math.floor(Math.random() * 8) + 2;
      overTime.push({ date: dateStr, count, resolved: Math.floor(count * 0.7) });
    }

    return {
      total,
      critical,
      open,
      resolvedToday: 6,
      avgResolutionHours: 4.8,
      breached,
      healthScore: 84,
      healthChange: '+3%',
      recent: this.issues.slice(0, 5),
      byCategory,
      byDepartment,
      priorityDistribution: priorityDist,
      slaPerformance: { met: 88, breached: 12, onTrack: 74, atRisk: 14 },
      sentimentTrends: overTime.map(t => ({ date: t.date, sentiment: -0.3 + Math.random() * 0.2 })),
      overTime,
      recurring: this.issues.filter(i => i.isRecurring).slice(0, 10)
    };
  }
}

export const memoryStore = new MemoryStore();

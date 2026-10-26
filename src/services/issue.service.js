import api from './api.js';
import { SEED_ISSUES } from '../data/seedData.js';
import { emitCampusEvent } from '../hooks/useSocket.js';

const STORAGE_KEY = 'campuspulse_issues_store';

const getLocalStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ISSUES));
    return [...SEED_ISSUES];
  } catch {
    return [...SEED_ISSUES];
  }
};

const saveLocalStore = (issues) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  } catch {}
};

export const issueService = {
  list: async (params = {}) => {
    try {
      const res = await api.get('/issues', { params });
      if (res.data && res.data.data) {
        return res.data;
      }
    } catch (e) {
      // Fallback to local store
    }

    let items = getLocalStore();

    if (params.category) {
      items = items.filter(i => i.category === params.category);
    }
    if (params.status) {
      items = items.filter(i => i.status === params.status);
    }
    if (params.priority) {
      items = items.filter(i => i.priorityLevel === params.priority);
    }
    if (params.building) {
      items = items.filter(i => i.location?.building?.toLowerCase().includes(params.building.toLowerCase()));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(i =>
        i.title?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.location?.building?.toLowerCase().includes(q) ||
        i.location?.room?.toLowerCase().includes(q)
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const total = items.length;
    const pages = Math.ceil(total / limit) || 1;
    const data = items.slice((page - 1) * limit, page * limit);

    return {
      success: true,
      data,
      pagination: { total, page, pages, limit }
    };
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/issues/${id}`);
      if (res.data && res.data.data) return res.data.data;
    } catch (e) {}

    const items = getLocalStore();
    const item = items.find(i => i._id === id || i.id === id);
    if (!item) throw new Error('Issue not found');
    return item;
  },

  create: async (issueData) => {
    try {
      const res = await api.post('/issues', issueData);
      if (res.data && res.data.data) {
        emitCampusEvent('issue.created', res.data.data);
        return res.data.data;
      }
    } catch (e) {}

    const items = getLocalStore();
    const newId = 'iss-' + Date.now();
    
    // Simulate AI Triage analysis
    const isCritical = (issueData.urgency === 'High' || /fire|smoke|hazard|spark|flood|outage/i.test(issueData.title + ' ' + issueData.description));
    const priorityLevel = isCritical ? 'CRITICAL' : (issueData.urgency === 'High' ? 'HIGH' : (issueData.urgency === 'Low' ? 'LOW' : 'MEDIUM'));
    
    const newIssue = {
      _id: newId,
      id: newId,
      title: issueData.title,
      description: issueData.description,
      category: issueData.category || 'Infrastructure',
      urgency: issueData.urgency || 'Medium',
      priorityLevel,
      status: 'REPORTED',
      impact: issueData.impact || 'Department',
      affectedUsers: issueData.affectedUsers || (isCritical ? 300 : 45),
      votesCount: 1,
      hasVoted: true,
      hasFollowed: true,
      location: {
        building: issueData.location?.building || 'Science & Technology Block A',
        block: issueData.location?.block || 'Main Wing',
        room: issueData.location?.room || 'Ground Floor',
        coordinates: issueData.location?.coordinates || { lat: 11.0168, lng: 76.9558 }
      },
      images: issueData.images || [],
      reportedBy: issueData.reportedBy || {
        _id: 'user-stu-demo',
        name: 'Saravanan S. (Student)',
        email: 'student@campuspulse.demo',
        role: 'STUDENT',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      },
      assignedDepartment: {
        id: 'dept-' + (issueData.category ? issueData.category.toLowerCase().slice(0, 4) : 'maint'),
        name: issueData.category + ' Maintenance & Operations'
      },
      aiAnalysis: {
        category: issueData.category,
        subcategory: issueData.subcategory || 'Incident Report',
        department: issueData.category + ' Operations',
        urgency: issueData.urgency || 'Medium',
        severity: isCritical ? 9.2 : 6.5,
        sentiment: 'Negative',
        sentimentScore: -0.6,
        summary: `AI analyzed: ${issueData.title} affecting ${issueData.location?.building || 'campus zone'}.`,
        keywords: [issueData.category?.toLowerCase(), 'campus issue', 'report'],
        confidence: 0.94,
        slaTargetHours: isCritical ? 2 : 12,
        slaDeadline: new Date(Date.now() + (isCritical ? 2 : 12) * 3600 * 1000).toISOString()
      },
      comments: [],
      timeline: [
        { status: 'REPORTED', timestamp: new Date().toISOString(), note: 'Reported by student via CampusPulse' },
        { status: 'TRIAGED', timestamp: new Date().toISOString(), note: `AI Triaged as ${priorityLevel} priority` }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    items.unshift(newIssue);
    saveLocalStore(items);
    emitCampusEvent('issue.created', newIssue);
    return newIssue;
  },

  updateStatus: async (id, status, note = '') => {
    try {
      const res = await api.patch(`/issues/${id}/status`, { status, note });
      if (res.data) {
        emitCampusEvent('issue.statusChanged', { issueId: id, status });
        return res.data;
      }
    } catch (e) {}

    const items = getLocalStore();
    const idx = items.findIndex(i => i._id === id || i.id === id);
    if (idx !== -1) {
      items[idx].status = status;
      items[idx].timeline = items[idx].timeline || [];
      items[idx].timeline.push({
        status,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${status}`
      });
      items[idx].updatedAt = new Date().toISOString();
      saveLocalStore(items);
      emitCampusEvent('issue.statusChanged', { issueId: id, status });
      return items[idx];
    }
  },

  vote: async (id) => {
    try {
      const res = await api.post(`/issues/${id}/vote`);
      if (res.data) return res.data;
    } catch (e) {}

    const items = getLocalStore();
    const idx = items.findIndex(i => i._id === id || i.id === id);
    if (idx !== -1) {
      if (items[idx].hasVoted) {
        items[idx].votesCount = Math.max(0, (items[idx].votesCount || 1) - 1);
        items[idx].hasVoted = false;
      } else {
        items[idx].votesCount = (items[idx].votesCount || 0) + 1;
        items[idx].hasVoted = true;
      }
      saveLocalStore(items);
      return { votesCount: items[idx].votesCount, hasVoted: items[idx].hasVoted };
    }
  },

  follow: async (id) => {
    try {
      const res = await api.post(`/issues/${id}/follow`);
      if (res.data) return res.data;
    } catch (e) {}

    const items = getLocalStore();
    const idx = items.findIndex(i => i._id === id || i.id === id);
    if (idx !== -1) {
      items[idx].hasFollowed = !items[idx].hasFollowed;
      saveLocalStore(items);
      return { hasFollowed: items[idx].hasFollowed };
    }
  },

  addComment: async (id, text, user) => {
    try {
      const res = await api.post(`/issues/${id}/comments`, { text });
      if (res.data && res.data.data) return res.data.data;
    } catch (e) {}

    const items = getLocalStore();
    const idx = items.findIndex(i => i._id === id || i.id === id);
    if (idx !== -1) {
      const newComment = {
        _id: 'c-' + Date.now(),
        text,
        user: {
          name: user?.name || 'Campus Student',
          role: user?.role || 'STUDENT',
          avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
        },
        createdAt: new Date().toISOString()
      };
      items[idx].comments = items[idx].comments || [];
      items[idx].comments.push(newComment);
      saveLocalStore(items);
      return newComment;
    }
  },

  analyzePreview: async ({ title, description, location, urgency }) => {
    try {
      const res = await api.post('/issues/analyze-preview', { title, description, location, urgency });
      if (res.data && res.data.data) return res.data.data;
    } catch (e) {}

    // Instant local AI analysis logic
    const text = `${title} ${description}`.toLowerCase();
    let category = 'Infrastructure';
    let department = 'Civil Infrastructure & Maintenance';
    if (text.includes('wifi') || text.includes('internet') || text.includes('network') || text.includes('server')) {
      category = 'Internet';
      department = 'IT Infrastructure & Networking';
    } else if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('tap') || text.includes('plumb')) {
      category = 'Water';
      department = 'Plumbing & Water Sanitation';
    } else if (text.includes('power') || text.includes('electric') || text.includes('spark') || text.includes('switch') || text.includes('light')) {
      category = 'Electricity';
      department = 'Electrical Engineering & Power';
    } else if (text.includes('food') || text.includes('cafeteria') || text.includes('canteen') || text.includes('mess')) {
      category = 'Food';
      department = 'Campus Food Safety & Canteen';
    } else if (text.includes('hostel') || text.includes('room') || text.includes('dorm')) {
      category = 'Hostel';
      department = 'Hostel Administration & Facilities';
    } else if (text.includes('security') || text.includes('guard') || text.includes('cctv') || text.includes('theft')) {
      category = 'Security';
      department = 'Campus Security & Emergency Response';
    }

    const isHazard = /urgent|critical|spark|fire|smoke|flood|emergency/i.test(text);
    const assignedUrgency = urgency || (isHazard ? 'High' : 'Medium');
    const severity = isHazard ? 9.2 : (assignedUrgency === 'High' ? 8.1 : (assignedUrgency === 'Low' ? 3.8 : 6.2));

    return {
      category,
      department,
      urgency: assignedUrgency,
      severity,
      sentiment: isHazard ? 'Negative' : 'Neutral',
      sentimentScore: isHazard ? -0.7 : -0.2,
      summary: `AI classified incident under ${category} handled by ${department}. Priority triage recommended.`,
      keywords: [category.toLowerCase(), location?.building || 'campus', 'facilities'],
      confidence: 0.95,
      slaTargetHours: isHazard ? 2 : 12,
      affectedUsers: isHazard ? 250 : 35
    };
  }
};

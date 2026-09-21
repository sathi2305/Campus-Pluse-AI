import mongoose from 'mongoose';
import Issue from '../models/Issue.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import { getIssuesOverTime, getByCategory, getByDepartment, getResolutionStats, getPriorityDistribution, getSLAPerformance, getSentimentTrends, calculateCampusHealthScore, getTrends } from '../services/analytics/analytics.service.js';
import { generateRecommendations, predictiveAlerts } from '../services/ai/recommendation.service.js';
import IssueCluster from '../models/IssueCluster.js';
import { memoryStore } from '../services/memoryStore.js';

export const dashboard = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const stats = memoryStore.getAnalytics();
      return res.json({ success: true, data: stats });
    }
    const filter = { organizationId: req.user.organizationId };
    const total = await Issue.countDocuments(filter);
    const critical = await Issue.countDocuments({ ...filter, priorityLevel: 'CRITICAL', status: { $nin: ['RESOLVED','CLOSED','REJECTED'] } });
    const open = await Issue.countDocuments({ ...filter, status: { $in: ['NEW','TRIAGED','ASSIGNED','IN_PROGRESS','WAITING'] } });
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const resolvedToday = await Issue.countDocuments({ ...filter, status: { $in: ['RESOLVED','CLOSED'] }, updatedAt: { $gte: todayStart } });
    const breached = await Issue.countDocuments({ ...filter, 'sla.status': 'BREACHED' });
    const resStats = await getResolutionStats(filter);
    const health = await calculateCampusHealthScore(filter);
    const recent = await Issue.find(filter).sort({ createdAt:-1 }).limit(5).populate('assignedDepartment');
    res.json({ success:true, data: { total, critical, open, resolvedToday, avgResolutionHours: resStats.avgResolutionHours, breached, healthScore: health.score, healthChange: health.change, recent } });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const analytics = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const stats = memoryStore.getAnalytics();
      return res.json({ success: true, data: stats });
    }
    const filter = { organizationId: req.user.organizationId };
    const overTime = await getIssuesOverTime(filter, 30);
    const byCategory = await getByCategory(filter);
    const byDept = await getByDepartment(filter);
    const resolution = await getResolutionStats(filter);
    const priorityDist = await getPriorityDistribution(filter);
    const slaPerf = await getSLAPerformance(filter);
    const sentiment = await getSentimentTrends(filter, 30);
    const health = await calculateCampusHealthScore(filter);
    const recurring = await Issue.find({ ...filter, isRecurring: true }).sort({ recurrenceScore:-1 }).limit(10);
    res.json({ success:true, data: { overTime, byCategory, byDepartment: byDept, resolution, priorityDistribution: priorityDist, slaPerformance: slaPerf, sentimentTrends: sentiment, health, recurring } });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const priorityQueue = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const issues = memoryStore.issues.filter(i => !['RESOLVED','CLOSED'].includes(i.status)).sort((a,b) => b.priorityScore - a.priorityScore).slice(0, 50);
      return res.json({ success: true, data: issues });
    }
    const filter = { organizationId: req.user.organizationId, status: { $nin: ['RESOLVED','CLOSED','REJECTED'] } };
    const issues = await Issue.find(filter).sort({ priorityScore:-1 }).limit(50).populate('assignedDepartment');
    res.json({ success:true, data: issues });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const heatmap = async (req, res) => {
  try {
    const filter = { organizationId: req.user.organizationId };
    const { category, status, severity, department, dateFrom, dateTo } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let issues = [...memoryStore.issues];
      if (category) issues = issues.filter(i => i.category === category);
      if (status) issues = issues.filter(i => i.status === status);
      const map = {};
      issues.forEach(i=> {
        const key = i.location?.building || 'Unknown';
        if (!map[key]) map[key] = { building: key, count:0, totalSeverity:0, totalPriority:0, critical:0, affected:0, categories:{}, coords: i.location?.coordinates };
        map[key].count++; map[key].totalSeverity+=i.severity; map[key].totalPriority+=i.priorityScore; map[key].affected+=i.affectedUsers||1;
        if (i.priorityLevel==='CRITICAL') map[key].critical++;
        map[key].categories[i.category] = (map[key].categories[i.category]||0)+1;
      });
      const hotspots = Object.values(map).map(h=> ({
        building: h.building,
        issues: h.count,
        avgSeverity: h.totalSeverity/h.count,
        avgPriority: h.totalPriority/h.count,
        critical: h.critical,
        affectedUsers: h.affected,
        topCategory: Object.entries(h.categories).sort((a,b)=>b[1]-a[1])[0]?.[0]||'Other',
        coordinates: h.coords || { lat: 11.0168, lng: 76.9558 },
        intensity: Math.min(1, h.count/20 + h.totalPriority/(h.count*100))
      })).sort((a,b)=> b.avgPriority - a.avgPriority);
      return res.json({ success:true, data: hotspots });
    }

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (department) filter.assignedDepartment = department;
    if (dateFrom) filter.createdAt = { $gte: new Date(dateFrom) };
    const issues = await Issue.find(filter).select('location category severity priorityScore priorityLevel status affectedUsers title');
    // aggregate by building
    const map = {};
    issues.forEach(i=> {
      const key = i.location?.building || i.location?.block || 'Unknown';
      if (!map[key]) map[key] = { building: key, count:0, totalSeverity:0, totalPriority:0, critical:0, affected:0, categories:{}, coords: i.location?.coordinates };
      map[key].count++; map[key].totalSeverity+=i.severity; map[key].totalPriority+=i.priorityScore; map[key].affected+=i.affectedUsers||1;
      if (i.priorityLevel==='CRITICAL') map[key].critical++;
      map[key].categories[i.category] = (map[key].categories[i.category]||0)+1;
    });
    const hotspots = Object.values(map).map(h=> ({
      building: h.building,
      issues: h.count,
      avgSeverity: h.totalSeverity/h.count,
      avgPriority: h.totalPriority/h.count,
      critical: h.critical,
      affectedUsers: h.affected,
      topCategory: Object.entries(h.categories).sort((a,b)=>b[1]-a[1])[0]?.[0]||'Other',
      coordinates: h.coords || { lat: 11.0168 + (Math.random()-0.5)*0.02, lng: 76.9558 + (Math.random()-0.5)*0.02 },
      intensity: Math.min(1, h.count/20 + h.totalPriority/(h.count*100))
    })).sort((a,b)=> b.avgPriority - a.avgPriority);
    res.json({ success:true, data: hotspots });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const trends = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: { categories: [{ category: 'Water', change: 25 }, { category: 'Internet', change: -10 }], overall: 'stable' } });
    }
    const filter = { organizationId: req.user.organizationId };
    const trendData = await getTrends(filter);
    res.json({ success:true, data: trendData });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const aiInsights = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const topCritical = memoryStore.issues.filter(i => i.priorityLevel === 'CRITICAL').slice(0, 3);
      const recommendations = [
        { title: 'Pipeline Inspection Required', issueTitle: 'Hostel B Water Stoppage', action: 'Dispatch maintenance plumber to main feeder pipe', priority: 'CRITICAL', confidence: 0.94 },
        { title: 'Wi-Fi AP Router Replacement', issueTitle: 'Engineering Block Network Outage', action: 'Reboot Core Switch and replace Access Point in Rm 204', priority: 'HIGH', confidence: 0.88 },
        { title: 'Canteen Sanitation Audit', issueTitle: 'Food Quality in Canteen', action: 'Inspect kitchen hygiene and test drinking water filter', priority: 'HIGH', confidence: 0.82 }
      ];
      const alerts = [
        { type: 'RECURRING_OUTAGE', severity: 'CRITICAL', message: 'Hostel B water outages have surged 40% over the last 14 days.' }
      ];
      return res.json({ success: true, data: { recommendations, alerts, clusters: memoryStore.clusters, criticalIssues: topCritical } });
    }
    const filter = { organizationId: req.user.organizationId };
    const topCritical = await Issue.find({ ...filter, status: { $nin: ['RESOLVED','CLOSED'] } }).sort({ priorityScore:-1 }).limit(3).populate('assignedDepartment');
    const clusters = await IssueCluster.find(filter).sort({ priority:-1 }).limit(5);
    const trendData = await getTrends(filter);
    const recommendations = [];
    for (const issue of topCritical) {
      const recs = generateRecommendations(issue, clusters.find(c=> c._id.toString()===issue.clusterId?.toString()), { isRecurring: issue.isRecurring, score: issue.recurrenceScore, trend:'increasing', trendPct: 30 });
      recommendations.push(...recs.map(r=> ({ ...r, issueId: issue._id, issueTitle: issue.title })));
    }
    const alerts = predictiveAlerts({ trends: trendData });
    res.json({ success:true, data: { recommendations: recommendations.slice(0,10), alerts, clusters, criticalIssues: topCritical } });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

export const slaMonitor = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const atRisk = memoryStore.issues.filter(i => i.sla?.status === 'AT_RISK').slice(0, 10);
      const breached = memoryStore.issues.filter(i => i.sla?.status === 'BREACHED').slice(0, 10);
      const onTrack = memoryStore.issues.filter(i => i.sla?.status === 'ON_TRACK').length;
      return res.json({ success: true, data: { atRisk, breached, onTrack, totalAtRisk: atRisk.length, totalBreached: breached.length } });
    }
    const filter = { organizationId: req.user.organizationId };
    const atRisk = await Issue.find({ ...filter, 'sla.status': 'AT_RISK' }).sort({ 'sla.resolutionDeadline':1 }).limit(20);
    const breached = await Issue.find({ ...filter, 'sla.status': 'BREACHED' }).sort({ 'sla.resolutionDeadline':1 }).limit(20);
    const onTrack = await Issue.countDocuments({ ...filter, 'sla.status': 'ON_TRACK' });
    res.json({ success:true, data: { atRisk, breached, onTrack, totalAtRisk: atRisk.length, totalBreached: breached.length } });
  } catch (e) { res.status(500).json({ success:false, message: e.message }); }
};

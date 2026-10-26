import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { adminService } from '../../services/admin.service.js';
import { issueService } from '../../services/issue.service.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import {
  Flame,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Shield,
  Layers
} from 'lucide-react';
import { DEPARTMENTS } from '../../utils/constants.js';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.stats(),
      adminService.priorityQueue()
    ]).then(([s, q]) => {
      setStats(s);
      setPriorityQueue(q);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Executive Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-600" />
              Campus Command & Control
            </h1>
            <p className="text-xs text-slate-500">
              Real-time operational triage, AI hazard classification, and departmental dispatch metrics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/admin/priority">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-xs">
                <Flame className="w-4 h-4" />
                Triage Queue ({priorityQueue.filter(i => i.priorityLevel === 'CRITICAL').length} Critical)
              </Button>
            </Link>

            <Link to="/admin/map">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-500" />
                Geospatial Heatmap
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 sm:p-5">
            <span className="text-xs font-semibold text-slate-500">Campus Health Score</span>
            <p className="text-3xl font-black text-indigo-600 mt-1">
              {stats?.healthScore || 94.8}%
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">Optimal operating state</span>
          </Card>

          <Card className="p-4 sm:p-5">
            <span className="text-xs font-semibold text-slate-500">Critical Incidents</span>
            <p className="text-3xl font-black text-red-600 mt-1">
              {stats?.criticalIssues || 2}
            </p>
            <span className="text-[11px] text-red-500 font-medium">Immediate hazard attention</span>
          </Card>

          <Card className="p-4 sm:p-5">
            <span className="text-xs font-semibold text-slate-500">SLA Adherence</span>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {stats?.slaCompliance || 92.4}%
            </p>
            <span className="text-[11px] text-indigo-600 font-medium">Within target resolution</span>
          </Card>

          <Card className="p-4 sm:p-5">
            <span className="text-xs font-semibold text-slate-500">Avg Resolution Speed</span>
            <p className="text-3xl font-black text-emerald-600 mt-1">
              {stats?.avgResolutionHours || 3.8}h
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">From student report</span>
          </Card>
        </div>

        {/* Priority Triage Highlight List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-600" />
                Urgent Priority Action Queue
              </h2>
              <Link to="/admin/priority" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                Full Queue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {priorityQueue.slice(0, 4).map(issue => (
                <Card key={issue._id || issue.id} className="p-4 hover:border-indigo-400 transition-all flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        issue.priorityLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        issue.priorityLevel === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {issue.priorityLevel}
                      </span>
                      <span className="text-xs font-bold text-slate-500">{issue.category}</span>
                      <span className="text-xs text-slate-400">• {issue.location?.building}</span>
                    </div>

                    <Link to={`/issues/${issue._id || issue.id}`} className="block font-bold text-sm text-slate-900 dark:text-slate-100 truncate hover:text-indigo-600">
                      {issue.title}
                    </Link>

                    <p className="text-xs text-slate-500 truncate">
                      {issue.aiAnalysis?.summary || issue.description}
                    </p>
                  </div>

                  <Link to={`/issues/${issue._id || issue.id}`}>
                    <Button size="xs" variant="outline" className="shrink-0">
                      Triage
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          {/* Department Workload Status */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Department Active Loads
            </h2>

            <Card className="p-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {DEPARTMENTS.slice(0, 5).map((d, i) => (
                <div key={d.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span>{d.icon}</span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{d.name.split('&')[0]}</p>
                      <p className="text-[10px] text-slate-400">Lead: {d.lead}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600">
                    {3 + (i % 3)} active
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

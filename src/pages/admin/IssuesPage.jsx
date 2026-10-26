import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { issueService } from '../../services/issue.service.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select, Input } from '../../components/ui/Input.jsx';
import { UrgencyPriorityBadge } from '../../components/common/CampusIssueMap.jsx';
import { CATEGORIES, STATUS, DEPARTMENTS } from '../../utils/constants.js';
import { ListOrdered, Search, Filter, RefreshCw, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export const AdminIssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', status: '', search: '' });

  const loadIssues = async () => {
    setLoading(true);
    try {
      const res = await issueService.list({ limit: 100, ...filters });
      setIssues(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [filters.category, filters.status]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await issueService.updateStatus(id, newStatus);
      setIssues(prev => prev.map(i => (i._id === id || i.id === id) ? { ...i, status: newStatus } : i));
      toast.success(`Updated status to ${newStatus}`);
    } catch {
      toast.error('Failed to change status');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ListOrdered className="w-6 h-6 text-indigo-600" />
              Central Incident Management
            </h1>
            <p className="text-xs text-slate-500">
              Complete administrative ledger of campus tickets with direct workflow status overrides
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={loadIssues} className="flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search title, building..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && loadIssues()}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <Select
            value={filters.category}
            onChange={e => setFilters({ ...filters, category: e.target.value })}
            className="text-xs"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>

          <Select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="text-xs"
          >
            <option value="">All Statuses</option>
            {STATUS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </Select>
        </Card>

        {/* Table View */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Ticket</th>
                  <th className="p-3.5">Category & Urgency</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Status Action</th>
                  <th className="p-3.5 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {issues.map(issue => (
                  <tr key={issue._id || issue.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 max-w-xs">
                      <Link to={`/issues/${issue._id || issue.id}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 line-clamp-1">
                        {issue.title}
                      </Link>
                      <p className="text-[11px] text-slate-400 mt-0.5">{new Date(issue.createdAt).toLocaleDateString()}</p>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{issue.category}</span>
                        <UrgencyPriorityBadge urgency={issue.urgency || issue.aiAnalysis?.urgency} />
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      <p className="font-medium">{issue.location?.building}</p>
                      <p className="text-[10px] text-slate-400">{issue.location?.room || 'General Area'}</p>
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {issue.assignedDepartment?.name || 'Pending'}
                    </td>

                    <td className="p-3.5">
                      <select
                        value={issue.status}
                        onChange={e => handleStatusUpdate(issue._id || issue.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        {STATUS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </td>

                    <td className="p-3.5 text-right">
                      <Link to={`/issues/${issue._id || issue.id}`}>
                        <Button size="xs" variant="ghost">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

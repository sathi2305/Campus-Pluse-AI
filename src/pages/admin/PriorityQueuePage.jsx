import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { adminService } from '../../services/admin.service.js';
import { issueService } from '../../services/issue.service.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { UrgencyPriorityBadge } from '../../components/common/CampusIssueMap.jsx';
import { Flame, Clock, ShieldAlert, CheckCircle2, UserCheck, ArrowUpDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export const PriorityQueuePage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await adminService.priorityQueue();
      setIssues(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleQuickStatus = async (id, status) => {
    try {
      await issueService.updateStatus(id, status, `Quick-action triage to ${status}`);
      setIssues(prev => prev.map(i => (i._id === id || i.id === id) ? { ...i, status } : i));
      toast.success(`Ticket marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-600" />
            AI Priority Triage & Rapid Dispatch Queue
          </h1>
          <p className="text-xs text-slate-500">
            Real-time ranked incidents sorted by safety risk severity, reported impact radius, and SLA deadline
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Card key={i} className="p-6 animate-pulse h-28" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue, idx) => (
              <Card key={issue._id || issue.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-indigo-400 transition-all">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
                    #{idx + 1}
                  </span>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        issue.priorityLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        issue.priorityLevel === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {issue.priorityLevel}
                      </span>

                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {issue.category}
                      </span>

                      <UrgencyPriorityBadge urgency={issue.urgency || issue.aiAnalysis?.urgency} />

                      <span className="text-xs text-slate-400">
                        • {issue.location?.building}
                      </span>
                    </div>

                    <Link to={`/issues/${issue._id || issue.id}`} className="block font-bold text-base text-slate-900 dark:text-slate-100 hover:text-indigo-600 truncate">
                      {issue.title}
                    </Link>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {issue.aiAnalysis?.summary || issue.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span>Status: <strong className="text-slate-700 dark:text-slate-300">{issue.status}</strong></span>
                      <span>Assigned: <strong className="text-slate-700 dark:text-slate-300">{issue.assignedDepartment?.name || 'Pending'}</strong></span>
                      <span>Affected: <strong className="text-slate-700 dark:text-slate-300">{issue.affectedUsers || 50} users</strong></span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {issue.status !== 'IN_PROGRESS' && (
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => handleQuickStatus(issue._id || issue.id, 'IN_PROGRESS')}
                    >
                      Dispatch
                    </Button>
                  )}
                  {issue.status !== 'RESOLVED' && (
                    <Button
                      size="xs"
                      variant="success"
                      onClick={() => handleQuickStatus(issue._id || issue.id, 'RESOLVED')}
                    >
                      Resolve
                    </Button>
                  )}
                  <Link to={`/issues/${issue._id || issue.id}`}>
                    <Button size="xs" variant="outline" className="flex items-center gap-1">
                      Details <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}

            {issues.length === 0 && (
              <Card className="p-12 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <p className="font-bold text-slate-800 dark:text-slate-200">Priority Queue Clean</p>
                <p className="text-xs text-slate-400">All high and critical incidents have been triaged or resolved.</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

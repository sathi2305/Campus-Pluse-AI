import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { issueService } from '../services/issue.service.js';
import { IssueCard } from '../components/common/IssueCard.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { FileText, Plus, CheckCircle2, Clock } from 'lucide-react';

export const MyIssuesPage = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'active' | 'resolved'

  useEffect(() => {
    issueService.list({ limit: 50 }).then(res => {
      // In demo or live mode, filter by reportedBy or show user issues
      const all = res.data || [];
      const userIssues = all.filter(i =>
        i.reportedBy?.email === user?.email ||
        i.reportedBy?._id === user?.id ||
        i.reportedBy?.id === user?.id ||
        i.hasFollowed ||
        i.hasVoted
      );
      setIssues(userIssues.length > 0 ? userIssues : all.slice(0, 3));
      setLoading(false);
    });
  }, [user]);

  const filtered = issues.filter(i => {
    if (filterTab === 'active') return i.status !== 'RESOLVED' && i.status !== 'CLOSED';
    if (filterTab === 'resolved') return i.status === 'RESOLVED' || i.status === 'CLOSED';
    return true;
  });

  return (
    <MainLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              My Campus Reports & Followed Issues
            </h1>
            <p className="text-xs text-slate-500">
              Track issues you submitted or bookmarked across campus facilities
            </p>
          </div>

          <Link to="/issues/new">
            <Button size="sm" className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Report Issue
            </Button>
          </Link>
        </div>

        {/* Tab filters */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${filterTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            All Reports ({issues.length})
          </button>
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${filterTab === 'active' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            In-Progress ({issues.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length})
          </button>
          <button
            onClick={() => setFilterTab('resolved')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${filterTab === 'resolved' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Resolved ({issues.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length})
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <Card key={i} className="p-6 animate-pulse h-28" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(issue => (
              <IssueCard key={issue._id || issue.id} issue={issue} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center text-slate-500 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium">No reports found matching this tab.</p>
            <Link to="/issues/new">
              <Button size="sm">Report an Issue Now</Button>
            </Link>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

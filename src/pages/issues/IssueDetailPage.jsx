import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.jsx';
import { issueService } from '../../services/issue.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { UrgencyPriorityBadge } from '../../components/common/CampusIssueMap.jsx';
import {
  MapPin,
  Clock,
  ThumbsUp,
  Bookmark,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  MessageSquare,
  ArrowLeft,
  Send,
  Building,
  User,
  Activity,
  Flame,
  CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';

export const IssueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadIssue = async () => {
    setLoading(true);
    try {
      const data = await issueService.getById(id);
      setIssue(data);
    } catch (e) {
      toast.error('Issue not found');
      navigate('/issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssue();
  }, [id]);

  const handleVote = async () => {
    if (!issue) return;
    try {
      const res = await issueService.vote(issue._id || issue.id);
      setIssue(prev => ({
        ...prev,
        votesCount: res.votesCount,
        hasVoted: res.hasVoted
      }));
    } catch {}
  };

  const handleFollow = async () => {
    if (!issue) return;
    try {
      const res = await issueService.follow(issue._id || issue.id);
      setIssue(prev => ({ ...prev, hasFollowed: res.hasFollowed }));
      toast.success(res.hasFollowed ? 'Following updates' : 'Unfollowed');
    } catch {}
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await issueService.updateStatus(issue._id || issue.id, newStatus, `Status updated by ${user?.name}`);
      setIssue(prev => ({ ...prev, status: newStatus, timeline: updated.timeline }));
      toast.success(`Status updated to ${newStatus}`);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const newComment = await issueService.addComment(issue._id || issue.id, commentText, user);
      setIssue(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));
      setCommentText('');
      toast.success('Comment posted');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading || !issue) {
    return (
      <MainLayout>
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-slate-500 mt-2">Loading incident details...</p>
        </div>
      </MainLayout>
    );
  }

  const isAdmin = ['CAMPUS_ADMIN', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN'].includes(user?.role);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link to="/issues" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to All Issues
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVote}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                issue.hasVoted
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${issue.hasVoted ? 'fill-current' : ''}`} />
              <span>{issue.votesCount || 0} Upvotes</span>
            </button>

            <button
              type="button"
              onClick={handleFollow}
              className={`p-2 rounded-xl border text-xs transition-all ${
                issue.hasFollowed
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700'
              }`}
              title="Bookmark / Follow"
            >
              <Bookmark className={`w-4 h-4 ${issue.hasFollowed ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Header Title Card */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              issue.priorityLevel === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
              issue.priorityLevel === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
              'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
              {issue.priorityLevel} PRIORITY
            </span>

            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {issue.status?.replace('_', ' ')}
            </span>

            <span className="text-xs text-indigo-600 font-bold flex items-center gap-1">
              <span>{issue.category}</span>
              <UrgencyPriorityBadge urgency={issue.urgency || issue.aiAnalysis?.urgency} />
            </span>

            <span className="ml-auto text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Logged on {new Date(issue.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
            {issue.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {issue.description}
          </p>

          {/* Location Bar */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Building className="w-4 h-4 text-indigo-600" />
              {issue.location?.building}
              {issue.location?.block && ` • ${issue.location.block}`}
              {issue.location?.room && ` • Room ${issue.location.room}`}
            </span>

            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              Reported by {issue.reportedBy?.name || 'Student'}
            </span>

            <span className="flex items-center gap-1.5 ml-auto font-mono text-[11px] text-slate-500">
              Coordinates: {issue.location?.coordinates?.lat || 11.0168}, {issue.location?.coordinates?.lng || 76.9558}
            </span>
          </div>

          {/* Attached Images */}
          {issue.images && issue.images.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Attached Photos</h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {issue.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Issue photo"
                    className="w-48 h-36 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                  />
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Admin Quick Action Controls */}
        {isAdmin && (
          <Card className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" /> Administrative Triage Controls
                </span>
                <p className="text-[11px] text-slate-500">Advance incident through workflow stages</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {issue.status !== 'IN_PROGRESS' && (
                  <Button size="xs" variant="primary" onClick={() => handleStatusChange('IN_PROGRESS')}>
                    Set In Progress
                  </Button>
                )}
                {issue.status !== 'RESOLVED' && (
                  <Button size="xs" variant="success" onClick={() => handleStatusChange('RESOLVED')}>
                    Mark Resolved
                  </Button>
                )}
                {issue.status !== 'CLOSED' && (
                  <Button size="xs" variant="secondary" onClick={() => handleStatusChange('CLOSED')}>
                    Close Ticket
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left: Comments & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline progression */}
            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" />
                Status Timeline
              </h3>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {(issue.timeline || [
                  { status: 'REPORTED', timestamp: issue.createdAt, note: 'Incident logged' }
                ]).map((t, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {t.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{t.note}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Comments Feed */}
            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Discussion & Technician Updates ({issue.comments?.length || 0})
              </h3>

              <div className="space-y-3">
                {(issue.comments || []).map((c, idx) => (
                  <div key={c._id || idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={c.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={c.user?.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{c.user?.name}</span>
                        {c.user?.role && c.user.role !== 'STUDENT' && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                            Staff
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7">{c.text}</p>
                  </div>
                ))}

                {(!issue.comments || issue.comments.length === 0) && (
                  <p className="text-xs text-slate-400 italic py-2">No updates yet. Post the first comment below.</p>
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a remark or inquiry..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="submit" size="sm" disabled={submittingComment} className="shrink-0 flex items-center gap-1">
                  <Send className="w-3.5 h-3.5" />
                  Post
                </Button>
              </form>
            </Card>
          </div>

          {/* Right Side: AI Intelligence Breakdown */}
          <div className="space-y-4">
            <Card className="p-5 bg-gradient-to-br from-indigo-50/60 to-violet-50/60 dark:from-slate-900 dark:to-indigo-950/30 border-indigo-200 dark:border-indigo-900/50 space-y-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Gemini AI Diagnostic Report
              </span>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Department</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {issue.assignedDepartment?.name || issue.aiAnalysis?.department || 'Operations Team'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Severity & Hazard Score</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-black text-indigo-600">
                      {issue.aiAnalysis?.severity || 7.0} / 10
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Impacts ~{issue.affectedUsers || 100} students
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">SLA Target</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-bold text-emerald-600">
                      {issue.aiAnalysis?.slaTargetHours || 4} Hours Resolution Target
                    </span>
                  </div>
                </div>

                {issue.aiAnalysis?.summary && (
                  <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "{issue.aiAnalysis.summary}"
                  </div>
                )}

                {issue.aiAnalysis?.keywords && (
                  <div className="pt-1 flex flex-wrap gap-1">
                    {issue.aiAnalysis.keywords.map((kw, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Map Action */}
            <Card className="p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                Geospatial Pin
              </h4>
              <p className="text-xs text-slate-500">
                View this incident on the central campus density heatmap alongside nearby reports:
              </p>
              <Link to={`/map`}>
                <Button variant="outline" size="sm" className="w-full">
                  Locate on Campus Heatmap
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

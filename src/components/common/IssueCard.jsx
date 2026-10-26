import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Sparkles,
  Clock,
  ChevronRight,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { issueService } from '../../services/issue.service.js';
import { UrgencyPriorityBadge } from './CampusIssueMap.jsx';
import { toast } from 'sonner';

export const IssueCard = ({ issue, onUpdate }) => {
  const [votes, setVotes] = useState(issue.votesCount || 0);
  const [hasVoted, setHasVoted] = useState(issue.hasVoted || false);
  const [isVoting, setIsVoting] = useState(false);
  const [hasFollowed, setHasFollowed] = useState(issue.hasFollowed || false);

  const handleVote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isVoting) return;
    setIsVoting(true);
    const nextVoted = !hasVoted;
    const nextCount = nextVoted ? votes + 1 : Math.max(0, votes - 1);
    setHasVoted(nextVoted);
    setVotes(nextCount);

    try {
      await issueService.vote(issue._id || issue.id);
      toast.success(nextVoted ? 'Upvoted issue!' : 'Removed vote');
    } catch {
      setHasVoted(!nextVoted);
      setVotes(votes);
    } finally {
      setIsVoting(false);
    }
  };

  const handleFollow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextFollowed = !hasFollowed;
    setHasFollowed(nextFollowed);
    try {
      await issueService.follow(issue._id || issue.id);
      toast.success(nextFollowed ? 'Following updates' : 'Unfollowed');
    } catch {
      setHasFollowed(!nextFollowed);
    }
  };

  const statusColors = {
    REPORTED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    TRIAGED: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    ASSIGNED: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    IN_PROGRESS: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    RESOLVED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    CLOSED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    REJECTED: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400'
  }[issue.status] || 'bg-slate-100 text-slate-700';

  const priorityBadgeStyle = {
    CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-900',
    HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-900',
    MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    LOW: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
  }[issue.priorityLevel] || 'bg-slate-100 text-slate-700';

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'recently';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all group flex flex-col sm:flex-row gap-4 items-start justify-between">
      {/* Left Upvote Column */}
      <div className="flex sm:flex-col items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
        <button
          type="button"
          onClick={handleVote}
          className={`flex sm:flex-col items-center justify-center gap-1 p-2.5 rounded-xl border transition-all ${
            hasVoted
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
          }`}
          title="Upvote this issue to increase triage priority"
        >
          <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
          <span className="text-xs font-bold">{votes}</span>
        </button>

        <button
          type="button"
          onClick={handleFollow}
          className={`p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
            hasFollowed ? 'text-indigo-600 dark:text-indigo-400' : ''
          }`}
          title={hasFollowed ? 'Following issue' : 'Follow for updates'}
        >
          <Bookmark className={`w-4 h-4 ${hasFollowed ? 'fill-current text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 space-y-2.5 w-full">
        {/* Header Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${priorityBadgeStyle}`}>
            {issue.priorityLevel === 'CRITICAL' && <Flame className="w-3 h-3 text-red-600 animate-pulse" />}
            {issue.priorityLevel || 'MEDIUM'}
          </span>

          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors}`}>
            {issue.status?.replace('_', ' ')}
          </span>

          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <span className="text-indigo-600 font-bold">{issue.category}</span>
            <UrgencyPriorityBadge urgency={issue.urgency || issue.aiAnalysis?.urgency} />
          </span>

          <span className="ml-auto text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {timeAgo(issue.createdAt)}
          </span>
        </div>

        {/* Title */}
        <Link
          to={`/issues/${issue._id || issue.id}`}
          className="block group-hover:text-indigo-600 transition-colors"
        >
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
            {issue.title}
          </h3>
        </Link>

        {/* AI Action Summary or Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {issue.aiAnalysis?.summary || issue.description}
        </p>

        {/* Footer Meta: Location, Assigned Dept, Comments count */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {[issue.location?.building, issue.location?.room].filter(Boolean).join(' • ') || 'Campus Area'}
            </span>

            {issue.assignedDepartment?.name && (
              <span className="hidden sm:inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300">
                🏢 {issue.assignedDepartment.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-500">
              <MessageSquare className="w-3.5 h-3.5" />
              {issue.comments?.length || 0}
            </span>

            <Link
              to={`/issues/${issue._id || issue.id}`}
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout.jsx';
import { CampusIssueMap, UrgencyPriorityBadge } from '../../components/common/CampusIssueMap.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { issueService } from '../../services/issue.service.js';
import { useSocket } from '../../hooks/useSocket.js';
import { MapPin, ListFilter, AlertCircle, RefreshCw, Plus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getIssueCoordinates } from '../../utils/mapIcons.js';

export const CampusMapPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const socket = useSocket();

  const loadIssues = async () => {
    setLoading(true);
    try {
      // Retrieve high volume of issues to populate the campus map
      const res = await issueService.list({ limit: 150 });
      setIssues(res.data || []);
    } catch (e) {
      console.error('Failed to load map issues:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  // Listen for real-time issue updates via Socket.IO
  useEffect(() => {
    if (!socket) return;
    const onCreated = (newIssue) => {
      setIssues(prev => [newIssue, ...prev]);
    };
    const onStatus = ({ issueId, status }) => {
      setIssues(prev => prev.map(i => (i._id === issueId || i.id === issueId) ? { ...i, status } : i));
    };
    socket.on('issue.created', onCreated);
    socket.on('issue.statusChanged', onStatus);
    return () => {
      socket.off('issue.created', onCreated);
      socket.off('issue.statusChanged', onStatus);
    };
  }, [socket]);

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Campus Geolocation Map
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Real-time spatial map with dynamic density heatmap overlay visualizing incident concentration across campus zones
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadIssues}
              disabled={loading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/issues/new">
              <Button size="sm" className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Report New Issue
              </Button>
            </Link>
          </div>
        </div>

        {/* Map View */}
        {loading && issues.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3" />
            <p className="text-sm text-slate-500">Loading campus geolocation data and incident markers...</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Interactive Map */}
            <div className="lg:col-span-3">
              <CampusIssueMap
                issues={issues}
                selectedIssueId={selectedIssueId}
                onSelectIssue={(issue) => setSelectedIssueId(issue._id || issue.id)}
                height="650px"
                title="Live Campus Incident Map"
              />
            </div>

            {/* Side Panel: Active Incident Feed */}
            <div className="space-y-3">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <ListFilter className="w-4 h-4 text-indigo-600" />
                    Quick Locations
                  </h3>
                  <span className="text-xs text-slate-400">{issues.length} total</span>
                </div>

                <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
                  {issues.slice(0, 30).map((issue) => {
                    const isSelected = selectedIssueId === (issue._id || issue.id);
                    const coords = getIssueCoordinates(issue);
                    return (
                      <div
                        key={issue._id || issue.id}
                        id={`map-issue-card-${issue._id || issue.id}`}
                        onClick={() => setSelectedIssueId(issue._id || issue.id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            issue.priorityLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            issue.priorityLevel === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {issue.priorityLevel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {coords[0].toFixed(3)}, {coords[1].toFixed(3)}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {issue.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
                            {issue.category}
                          </span>
                          <UrgencyPriorityBadge urgency={issue.urgency || issue.aiAnalysis?.urgency} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 flex items-center justify-between">
                          <span>{issue.location?.building || 'Campus Grounds'}</span>
                          <span className="text-indigo-600 dark:text-indigo-400 flex items-center font-medium">
                            Focus <ChevronRight className="w-3 h-3 ml-0.5" />
                          </span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

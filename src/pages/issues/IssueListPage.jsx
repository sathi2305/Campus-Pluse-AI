import React, { useEffect, useState } from 'react';
import { Search, Filter, MapPin, LayoutList, Map as MapIcon, Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { IssueCard } from '../../components/common/IssueCard.jsx';
import { CampusIssueMap } from '../../components/common/CampusIssueMap.jsx';
import { issueService } from '../../services/issue.service.js';
import { CATEGORIES, STATUS, PRIORITY_LEVELS } from '../../utils/constants.js';
import { useSocket } from '../../hooks/useSocket.js';

export const IssueListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get('view') === 'map' ? 'map' : 'list';
  const [viewMode, setViewMode] = useState(initialView);
  const [issues, setIssues] = useState([]);
  const [mapIssues, setMapIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search:'', category:'', status:'', priority:'', building:'' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const socket = useSocket();

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await issueService.list({
        page,
        limit: viewMode === 'map' ? 100 : 20,
        search: filters.search || undefined,
        category: filters.category || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        building: filters.building || undefined
      });
      setIssues(res.data || []);
      setPagination(res.pagination || {});
      if (viewMode === 'map' || mapIssues.length === 0) {
        setMapIssues(res.data || []);
      }
    } catch {} finally { setLoading(false); }
  };

  const handleToggleView = (mode) => {
    setViewMode(mode);
    setSearchParams(mode === 'map' ? { view: 'map' } : {});
    if (mode === 'map' && mapIssues.length < 20) {
      // Fetch larger set for map markers
      issueService.list({ limit: 100, ...filters }).then(res => setMapIssues(res.data || []));
    }
  };

  useEffect(() => { fetchIssues(); }, [page, filters.category, filters.status, filters.priority, viewMode]);

  useEffect(() => {
    if (!socket) return;
    const onCreated = (issue) => {
      setIssues(prev => [issue, ...prev].slice(0, 20));
      setMapIssues(prev => [issue, ...prev]);
    };
    const onStatus = ({ issueId, status }) => {
      setIssues(prev => prev.map(i => i._id === issueId ? { ...i, status } : i));
      setMapIssues(prev => prev.map(i => i._id === issueId ? { ...i, status } : i));
    };
    socket.on('issue.created', onCreated);
    socket.on('issue.statusChanged', onStatus);
    return () => { socket.off('issue.created', onCreated); socket.off('issue.statusChanged', onStatus); };
  }, [socket]);

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-indigo-600" />
              Campus Issues
            </h1>
            <span className="text-sm text-slate-500">{pagination.total || issues.length} issues reported</span>
          </div>

          <div className="flex items-center gap-2">
            {/* List / Map View Toggle */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                id="view-toggle-list-btn"
                onClick={() => handleToggleView('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                List
              </button>
              <button
                type="button"
                id="view-toggle-map-btn"
                onClick={() => handleToggleView('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                Interactive Map
              </button>
            </div>

            <Link to="/issues/new">
              <Button size="sm" className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Report Issue
              </Button>
            </Link>
          </div>
        </div>

        {viewMode === 'map' ? (
          <CampusIssueMap
            issues={mapIssues.length > 0 ? mapIssues : issues}
            height="640px"
            title="Interactive Campus Geolocation Map"
          />
        ) : (
          <>
            <Card className="p-4">
              <div className="grid md:grid-cols-5 gap-3">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                  <input
                    value={filters.search}
                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && fetchIssues()}
                    placeholder="Search title, description, building..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                  />
                </div>
                <Select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
                <Select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                  <option value="">All Status</option>
                  {STATUS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </Select>
                <Select value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
                  <option value="">All Priority</option>
                  {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="sm" onClick={fetchIssues}>Apply Filters</Button>
                <Button variant="ghost" size="sm" onClick={() => setFilters({ search: '', category: '', status: '', priority: '', building: '' })}>Clear</Button>
              </div>
            </Card>

            {loading ? (
              <div className="grid gap-3">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-5 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"/>
                    <div className="h-3 bg-slate-100 rounded w-full"/>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-3">
                {issues.map(issue => <IssueCard key={issue._id || issue.id} issue={issue} />)}
                {issues.length === 0 && (
                  <Card className="p-10 text-center text-sm text-slate-500">
                    No issues match filters
                  </Card>
                )}
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

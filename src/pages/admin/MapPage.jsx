import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { adminService } from '../../services/admin.service.js';
import { issueService } from '../../services/issue.service.js';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Select } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { CampusIssueMap, UrgencyPriorityBadge } from '../../components/common/CampusIssueMap.jsx';
import { CATEGORIES, STATUS } from '../../utils/constants.js';
import { MapPin, Flame, Layers, RefreshCw } from 'lucide-react';

export const MapPage = () => {
  const [viewMode, setViewMode] = useState('issues'); // 'issues' or 'hotspots'
  const [hotspots, setHotspots] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', status: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [heatRes, issuesRes] = await Promise.all([
        adminService.heatmap(filters).catch(() => ({ data: [] })),
        issueService.list({ limit: 150, ...filters }).catch(() => ({ data: [] }))
      ]);
      setHotspots(heatRes.data || []);
      setIssues(issuesRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-indigo-600" />
              Campus Geolocation & Intelligence Map
            </h1>
            <p className="text-sm text-slate-500">
              Interactive Leaflet spatial view of reported incidents and critical facility hotspots
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                id="admin-map-view-issues-btn"
                onClick={() => setViewMode('issues')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'issues'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Heatmap & Issues ({issues.length})
              </button>
              <button
                type="button"
                id="admin-map-view-hotspots-btn"
                onClick={() => setViewMode('hotspots')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'hotspots'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Building Hotspots ({hotspots.length})
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* View Mode: Individual Issues Map with Geolocation Markers */}
        {viewMode === 'issues' ? (
          <CampusIssueMap
            issues={issues}
            height="640px"
            title="All Reported Campus Incidents"
          />
        ) : (
          /* View Mode: Aggregated Building Hotspots */
          <div className="space-y-4">
            <Card className="p-4 flex flex-wrap gap-3">
              <Select
                value={filters.category}
                onChange={e => setFilters({ ...filters, category: e.target.value })}
                className="w-48 text-xs"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
                className="w-48 text-xs"
              >
                <option value="">All Status</option>
                {STATUS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </Select>
              {(filters.category || filters.status) && (
                <Button variant="ghost" size="sm" onClick={() => setFilters({ category: '', status: '' })}>
                  Clear Filters
                </Button>
              )}
            </Card>

            <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="h-[600px]">
                <MapContainer center={[11.0168, 76.9558]} zoom={16} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {hotspots.map((h, i) => (
                    <CircleMarker
                      key={i}
                      center={[
                        h.coordinates?.lat || 11.0168 + (Math.random() - 0.5) * 0.015,
                        h.coordinates?.lng || 76.9558 + (Math.random() - 0.5) * 0.015
                      ]}
                      radius={Math.max(12, (h.intensity || 0.3) * 35 + (h.issues || 1) * 2)}
                      pathOptions={{
                        color: h.avgPriority >= 90 ? '#ef4444' : h.avgPriority >= 70 ? '#f97316' : '#3b82f6',
                        fillColor: h.avgPriority >= 90 ? '#ef4444' : h.avgPriority >= 70 ? '#f97316' : '#3b82f6',
                        fillOpacity: 0.55
                      }}
                    >
                      <Popup>
                        <div className="text-sm p-1 text-slate-900">
                          <p className="font-bold text-base mb-1">{h.building}</p>
                          <div className="grid grid-cols-2 gap-1 text-xs text-slate-600 mb-2">
                            <p><span className="text-slate-400">Issues:</span> {h.issues}</p>
                            <p><span className="text-slate-400">Critical:</span> {h.critical}</p>
                            <p><span className="text-slate-400">Affected:</span> {h.affectedUsers}</p>
                            <p><span className="text-slate-400">Priority:</span> {Math.round(h.avgPriority || 50)}</p>
                          </div>
                          <div className="flex items-center justify-between gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 p-1.5 rounded">
                            <span>Top: {h.topCategory || 'General'}</span>
                            <UrgencyPriorityBadge urgency={h.critical > 0 ? 'High' : (h.avgPriority >= 65 ? 'Medium' : 'Low')} />
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </Card>

            <div className="grid md:grid-cols-3 gap-3">
              {hotspots.slice(0, 6).map((h, i) => (
                <Card key={i} className="p-4">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{h.building}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1 flex-wrap gap-1">
                    <span>{h.issues} issues • {h.critical} critical • {h.affectedUsers} affected</span>
                    <div className="flex items-center gap-1">
                      <span>Top: {h.topCategory}</span>
                      <UrgencyPriorityBadge urgency={h.critical > 0 ? 'High' : (h.avgPriority >= 65 ? 'Medium' : 'Low')} />
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(15, (h.intensity || 0.2) * 100))}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Crosshair,
  Maximize2,
  Filter,
  Search,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ChevronRight,
  Layers,
  Sparkles,
  Sliders,
  Radio,
  Eye,
  Activity,
  Compass,
  X
} from 'lucide-react';
import {
  CAMPUS_CENTER,
  DEFAULT_ZOOM,
  getIssueCoordinates,
  createIssueMarkerIcon
} from '../../utils/mapIcons.js';
import { CATEGORIES, STATUS, PRIORITY_LEVELS } from '../../utils/constants.js';
import { CAMPUS_ZONES, computeZoneDensityStats } from '../../utils/campusZones.js';
import { formatIssuesToHeatPoints, HEATMAP_GRADIENTS } from '../../utils/heatmapUtils.js';
import { LeafletHeatmapOverlay } from './LeafletHeatmapOverlay.jsx';
import { CampusZoneOverlay } from './CampusZoneOverlay.jsx';

// Reusable priority badge displaying the AI-assigned urgency next to category tags
export const UrgencyPriorityBadge = ({ urgency, className = '', id }) => {
  const norm = (() => {
    if (!urgency) return 'Medium';
    const s = String(urgency).trim().toLowerCase();
    if (s === 'high' || s === 'critical' || s === 'urgent') return 'High';
    if (s === 'low') return 'Low';
    return 'Medium';
  })();

  const styles = {
    High: {
      badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
      dot: 'bg-red-500'
    },
    Medium: {
      badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      dot: 'bg-amber-500'
    },
    Low: {
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      dot: 'bg-emerald-500'
    }
  }[norm];

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-xs ${styles.badge} ${className}`}
      title={`AI Urgency: ${norm} Priority`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {norm} Priority
    </span>
  );
};

// Map controller for programmatic pan, zoom, and target flying
const MapController = ({ selectedIssue, targetCenter, shouldFitBounds, filteredIssues }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedIssue) {
      const coords = getIssueCoordinates(selectedIssue);
      map.flyTo(coords, 17, { duration: 1.2 });
    }
  }, [selectedIssue, map]);

  useEffect(() => {
    if (targetCenter) {
      map.flyTo(targetCenter.center, targetCenter.zoom || DEFAULT_ZOOM, { duration: 1.0 });
    }
  }, [targetCenter, map]);

  useEffect(() => {
    if (shouldFitBounds && filteredIssues.length > 0) {
      try {
        const bounds = filteredIssues.map(i => getIssueCoordinates(i));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
      } catch (err) {
        console.warn('Could not fit map bounds', err);
      }
    }
  }, [shouldFitBounds, filteredIssues, map]);

  return null;
};

export const CampusIssueMap = ({
  issues = [],
  selectedIssueId = null,
  onSelectIssue = null,
  height = '640px',
  showFilters = true,
  title = 'Interactive Campus Issues & Heatmap'
}) => {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [targetCenter, setTargetCenter] = useState(null);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState(0);

  // Layer & Visual Display States
  // 'hybrid' = Heatmap + Markers | 'heatmap' = Heatmap Only | 'markers' = Markers Only
  const [displayMode, setDisplayMode] = useState('hybrid');
  const [showZones, setShowZones] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showHeatmapControls, setShowHeatmapControls] = useState(false);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState(null);

  // Heatmap Parameters
  const [weightMode, setWeightMode] = useState('severity'); // 'severity' | 'count' | 'active_only'
  const [gradientType, setGradientType] = useState('standard'); // 'standard' | 'inferno' | 'neon'
  const [radius, setRadius] = useState(30);
  const [blur, setBlur] = useState(20);
  const [minOpacity, setMinOpacity] = useState(0.4);

  // Standard Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [hideResolved, setHideResolved] = useState(false);

  // Sync selected issue if controlled externally
  useEffect(() => {
    if (selectedIssueId && issues.length > 0) {
      const found = issues.find(i => (i._id === selectedIssueId || i.id === selectedIssueId));
      if (found) setSelectedIssue(found);
    }
  }, [selectedIssueId, issues]);

  // Apply filters to issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (hideResolved && (issue.status === 'RESOLVED' || issue.status === 'CLOSED')) {
        return false;
      }
      if (category && issue.category !== category) return false;
      if (status && issue.status !== status) return false;
      if (priority && issue.priorityLevel !== priority) return false;

      // Filter by selected zone if user clicked a zone filter
      if (selectedZoneFilter) {
        const building = issue.location?.building?.toLowerCase() || '';
        const inZone = selectedZoneFilter.buildings.some(
          b => building.includes(b.toLowerCase()) || b.toLowerCase().includes(building)
        );
        if (!inZone) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = issue.title?.toLowerCase().includes(q);
        const descMatch = issue.description?.toLowerCase().includes(q);
        const buildingMatch = issue.location?.building?.toLowerCase().includes(q);
        const roomMatch = issue.location?.room?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !buildingMatch && !roomMatch) return false;
      }
      return true;
    });
  }, [issues, category, status, priority, search, hideResolved, selectedZoneFilter]);

  // Compute spatial zone density metrics from current filtered issues
  const zoneDensityStats = useMemo(() => {
    return computeZoneDensityStats(filteredIssues, CAMPUS_ZONES);
  }, [filteredIssues]);

  // Format dynamic heat points from filtered issues
  const heatPoints = useMemo(() => {
    return formatIssuesToHeatPoints(filteredIssues, {
      weightMode,
      boostCritical: true,
      minIntensity: 0.25
    });
  }, [filteredIssues, weightMode]);

  // Summary stats
  const stats = useMemo(() => {
    const total = filteredIssues.length;
    const critical = filteredIssues.filter(i => i.priorityLevel === 'CRITICAL' && i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
    const high = filteredIssues.filter(i => i.priorityLevel === 'HIGH' && i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
    const resolved = filteredIssues.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
    const criticalZonesCount = zoneDensityStats.filter(z => z.densityLevel === 'CRITICAL').length;
    return { total, critical, high, resolved, criticalZonesCount };
  }, [filteredIssues, zoneDensityStats]);

  const handleMarkerClick = (issue) => {
    setSelectedIssue(issue);
    if (onSelectIssue) onSelectIssue(issue);
  };

  const handleRecenter = () => {
    setTargetCenter({ center: [...CAMPUS_CENTER], zoom: DEFAULT_ZOOM });
    setSelectedZoneFilter(null);
  };

  const handleFitBounds = () => {
    setFitBoundsTrigger(prev => prev + 1);
  };

  const handleZoneClick = (zone) => {
    setTargetCenter({ center: zone.center, zoom: 17 });
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setPriority('');
    setHideResolved(false);
    setSelectedZoneFilter(null);
  };

  const showHeatmap = displayMode === 'hybrid' || displayMode === 'heatmap';
  const showMarkers = displayMode === 'hybrid' || displayMode === 'markers';

  return (
    <div id="campus-issue-map-container" className="space-y-3">
      {/* Top Header & Filter Controls */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                {title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dynamic Leaflet density heatmap visualizing incident concentration across {CAMPUS_ZONES.length} campus zones
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                {stats.total} Issues
              </span>
              {stats.criticalZonesCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                  <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                  {stats.criticalZonesCount} Critical {stats.criticalZonesCount === 1 ? 'Zone' : 'Zones'}
                </span>
              )}
              {stats.critical > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {stats.critical} Critical
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {stats.resolved} Resolved
              </span>
            </div>
          </div>

          {/* Mode Switcher & Layer Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
            {/* Display Mode Tabs */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
              <button
                type="button"
                id="map-mode-hybrid-btn"
                onClick={() => setDisplayMode('hybrid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  displayMode === 'hybrid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Hybrid (Heat + Pins)</span>
              </button>

              <button
                type="button"
                id="map-mode-heatmap-btn"
                onClick={() => setDisplayMode('heatmap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  displayMode === 'heatmap'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Heatmap Density</span>
              </button>

              <button
                type="button"
                id="map-mode-markers-btn"
                onClick={() => setDisplayMode('markers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  displayMode === 'markers'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Markers Only</span>
              </button>
            </div>

            {/* Zone Boundaries & Heatmap Options Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="map-toggle-zones-btn"
                onClick={() => setShowZones(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  showZones
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Campus Zones ({showZones ? 'Visible' : 'Hidden'})</span>
              </button>

              <button
                type="button"
                id="map-heatmap-settings-btn"
                onClick={() => setShowHeatmapControls(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  showHeatmapControls
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                <span>Heatmap Config</span>
              </button>
            </div>
          </div>

          {/* Collapsible Heatmap Tuning Panel */}
          {showHeatmapControls && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" /> Dynamic Heatmap Density Controls
                </span>
                <button
                  type="button"
                  onClick={() => setShowHeatmapControls(false)}
                  className="p-1 rounded-md text-amber-700 dark:text-amber-400 hover:bg-amber-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {/* Weighting Mode */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Density Weight Mode
                  </label>
                  <select
                    id="heatmap-weight-mode-select"
                    value={weightMode}
                    onChange={e => setWeightMode(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="severity">Priority Weighted (Critical = Hottest)</option>
                    <option value="count">Pure Volume (Incident Count)</option>
                    <option value="active_only">Active Only (Unresolved)</option>
                  </select>
                </div>

                {/* Color Scheme */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Color Gradient
                  </label>
                  <select
                    id="heatmap-gradient-select"
                    value={gradientType}
                    onChange={e => setGradientType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="standard">Standard (Blue → Yellow → Red)</option>
                    <option value="inferno">Inferno (Yellow → Red → Crimson)</option>
                    <option value="neon">Neon Spectrum (Purple → Pink → Cyan)</option>
                  </select>
                </div>

                {/* Radius Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Heat Radius: {radius}px
                    </label>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    step="2"
                    value={radius}
                    onChange={e => setRadius(Number(e.target.value))}
                    className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                </div>

                {/* Opacity Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Intensity Opacity: {Math.round(minOpacity * 100)}%
                    </label>
                  </div>
                  <input
                    type="range"
                    min="0.15"
                    max="0.8"
                    step="0.05"
                    value={minOpacity}
                    onChange={e => setMinOpacity(Number(e.target.value))}
                    className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Campus Zones Density Quick-Bar */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                Campus Zones Density Status
              </span>
              {selectedZoneFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedZoneFilter(null)}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  Clear Zone Filter ({selectedZoneFilter.shortName}) <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Horizontal Scrollable Zone Density Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {zoneDensityStats.map(stat => {
                const { zone, densityLevel, densityColor, densityLabel, activeIssues, totalIssues } = stat;
                const isSelected = selectedZoneFilter?.id === zone.id;

                return (
                  <button
                    key={zone.id}
                    type="button"
                    id={`zone-density-chip-${zone.id}`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedZoneFilter(null);
                      } else {
                        setSelectedZoneFilter(zone);
                        handleZoneClick(zone);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300'
                        : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{zone.icon}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{zone.shortName}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor: `${densityColor}20`,
                        color: densityColor
                      }}
                    >
                      {activeIssues} active
                    </span>
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: densityColor }}
                      title={densityLabel}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Standard Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-1">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                id="map-filter-search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search issue title, room, or building..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              id="map-filter-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              aria-label="Filter by Category"
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories ({CATEGORIES.length})</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              id="map-filter-priority"
              value={priority}
              onChange={e => setPriority(e.target.value)}
              aria-label="Filter by Priority"
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Priorities</option>
              {PRIORITY_LEVELS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              id="map-filter-status"
              value={status}
              onChange={e => setStatus(e.target.value)}
              aria-label="Filter by Status"
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              {STATUS.map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                id="map-filter-hide-resolved"
                checked={hideResolved}
                onChange={e => setHideResolved(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span>Hide resolved & closed issues</span>
            </label>

            {(category || status || priority || search || hideResolved || selectedZoneFilter) && (
              <button
                type="button"
                id="map-filters-reset-btn"
                onClick={resetFilters}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map Card Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md" style={{ height }}>
        <MapContainer
          center={CAMPUS_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController
            selectedIssue={selectedIssue}
            targetCenter={targetCenter}
            shouldFitBounds={fitBoundsTrigger}
            filteredIssues={filteredIssues}
          />

          {/* Dynamic Leaflet Heatmap Layer */}
          {showHeatmap && (
            <LeafletHeatmapOverlay
              points={heatPoints}
              radius={radius}
              blur={blur}
              minOpacity={minOpacity}
              gradientType={gradientType}
              visible={showHeatmap}
            />
          )}

          {/* Campus Zones Boundary Overlay */}
          <CampusZoneOverlay
            zoneStats={zoneDensityStats}
            visible={showZones}
            onSelectZone={handleZoneClick}
          />

          {/* Render individual issue markers when enabled in hybrid/markers mode */}
          {showMarkers && filteredIssues.map(issue => {
            const coords = getIssueCoordinates(issue);
            const isSelected = selectedIssue && (selectedIssue._id === issue._id || selectedIssue.id === issue.id);

            return (
              <Marker
                key={issue._id || issue.id}
                position={coords}
                icon={createIssueMarkerIcon(issue, isSelected)}
                eventHandlers={{
                  click: () => handleMarkerClick(issue)
                }}
              >
                {/* Marker Hover Tooltip with Category & Urgency Priority Badge */}
                <Tooltip direction="top" offset={[0, -20]} opacity={0.96}>
                  <div className="text-[11px] p-0.5 font-sans leading-tight">
                    <p className="font-bold text-slate-900 max-w-[200px] truncate">{issue.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-medium text-slate-600">{issue.category}</span>
                      <UrgencyPriorityBadge urgency={issue.urgency || issue.aiAnalysis?.urgency} />
                    </div>
                  </div>
                </Tooltip>

                <Popup className="campus-issue-popup" minWidth={280} maxWidth={320}>
                  <div className="p-1 space-y-2 text-slate-900">
                    {/* Header badges */}
                    <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        issue.priorityLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        issue.priorityLevel === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                        issue.priorityLevel === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {issue.priorityLevel || 'MEDIUM'} PRIORITY
                      </span>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {issue.status?.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Title */}
                    <Link
                      to={`/issues/${issue._id || issue.id}`}
                      className="block font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 leading-tight"
                    >
                      {issue.title}
                    </Link>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-semibold">Category</span>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="font-semibold text-slate-800">{issue.category}</span>
                          <UrgencyPriorityBadge
                            urgency={issue.urgency || issue.aiAnalysis?.urgency}
                            id={`map-category-urgency-${issue._id || issue.id}`}
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-semibold">Department</span>
                        <span className="font-semibold text-slate-800">{issue.assignedDepartment?.name || issue.departmentId?.name || issue.departmentId || 'General'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[9px] uppercase font-semibold">Location</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          {[issue.location?.building, issue.location?.block && `Block ${issue.location.block}`, issue.location?.room && `Room ${issue.location.room}`].filter(Boolean).join(' • ') || 'Campus Grounds'}
                        </span>
                      </div>
                    </div>

                    {/* Geolocation details */}
                    <div className="text-[10px] text-slate-500 flex items-center justify-between px-1">
                      <span>Coordinates:</span>
                      <span className="font-mono text-slate-700 font-medium">
                        {coords[0].toFixed(4)}°N, {coords[1].toFixed(4)}°E
                      </span>
                    </div>

                    {/* AI Summary or description */}
                    {(issue.aiAnalysis?.summary || issue.description) && (
                      <p className="text-xs text-slate-600 line-clamp-2 italic bg-indigo-50/50 p-1.5 rounded border border-indigo-100/60">
                        "{issue.aiAnalysis?.summary || issue.description}"
                      </p>
                    )}

                    {/* Action button */}
                    <div className="pt-1">
                      <Link
                        to={`/issues/${issue._id || issue.id}`}
                        className="w-full flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                      >
                        <span>View Issue Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Map Action Controls (Recenter, Fit Bounds, Legend Toggle) */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
          <button
            type="button"
            id="map-recenter-campus-btn"
            onClick={handleRecenter}
            title="Recenter Campus Center"
            className="p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Crosshair className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </button>

          <button
            type="button"
            id="map-fit-bounds-btn"
            onClick={handleFitBounds}
            title="Fit All Filtered Markers"
            className="p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>

          <button
            type="button"
            id="map-toggle-legend-btn"
            onClick={() => setShowLegend(prev => !prev)}
            title="Toggle Map Legend"
            className={`p-2.5 rounded-xl shadow-md border transition-colors ${
              showLegend
                ? 'bg-indigo-600 text-white border-indigo-700'
                : 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-indigo-50'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Floating Heatmap & Density Legend Panel */}
        {showLegend && (
          <div className="absolute bottom-3 left-3 z-[1000] p-3 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg text-xs space-y-2.5 max-w-xs animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Density Heatmap Legend
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{heatPoints.length} Heatpoints</span>
            </div>

            {/* Heat Gradient Visual Bar */}
            {showHeatmap && (
              <div className="space-y-1 pt-0.5">
                <div className="h-2.5 rounded-full w-full bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-red-500 shadow-inner" />
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold px-0.5">
                  <span>Low Density</span>
                  <span>Moderate</span>
                  <span>High</span>
                  <span className="text-red-500">Critical</span>
                </div>
              </div>
            )}

            {/* Marker Priority Legend */}
            {showMarkers && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                  Marker Priority
                </span>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-sm ring-2 ring-red-200"></span>
                    <span>Critical</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-sm"></span>
                    <span>High</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm"></span>
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
                    <span>Low</span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
              Hover zone circles to preview localized density breakdown or click any marker for issue details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

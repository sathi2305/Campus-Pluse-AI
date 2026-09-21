import React from 'react';
import { Circle, Popup, Tooltip } from 'react-leaflet';
import { Flame, AlertTriangle, CheckCircle2, MapPin, Building2, ChevronRight } from 'lucide-react';

export const CampusZoneOverlay = ({
  zoneStats = [],
  visible = true,
  onSelectZone = null
}) => {
  if (!visible) return null;

  return (
    <>
      {zoneStats.map((stat) => {
        const { zone, densityLevel, densityColor, densityLabel, totalIssues, activeIssues, criticalIssues, resolvedIssues, topCategories } = stat;

        // Visual styling based on density level
        const isCritical = densityLevel === 'CRITICAL';
        const isHigh = densityLevel === 'HIGH';
        const isModerate = densityLevel === 'MODERATE';

        const strokeColor = densityColor;
        const fillColor = densityColor;
        const fillOpacity = isCritical ? 0.22 : isHigh ? 0.18 : isModerate ? 0.12 : 0.08;
        const weight = isCritical ? 2.5 : isHigh ? 2 : 1.5;
        const dashArray = isCritical ? 'none' : '4, 4';

        return (
          <Circle
            key={zone.id}
            center={zone.center}
            radius={zone.radius}
            pathOptions={{
              color: strokeColor,
              fillColor: fillColor,
              fillOpacity: fillOpacity,
              weight: weight,
              dashArray: dashArray
            }}
          >
            {/* Hover Tooltip with density summary */}
            <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
              <div className="text-xs font-sans text-slate-800 space-y-0.5">
                <div className="font-bold flex items-center gap-1">
                  <span>{zone.icon}</span>
                  <span>{zone.shortName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: densityColor }}
                  />
                  <span className="font-semibold" style={{ color: densityColor }}>
                    {densityLabel}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>{activeIssues} active issues</span>
                </div>
              </div>
            </Tooltip>

            {/* Click Popup with in-depth breakdown */}
            <Popup className="campus-zone-popup" minWidth={280} maxWidth={320}>
              <div className="p-1 space-y-2.5 text-slate-900">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{zone.icon}</span>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">
                        {zone.name}
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {zone.category} Campus Zone
                    </span>
                  </div>

                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0"
                    style={{
                      backgroundColor: `${densityColor}18`,
                      color: densityColor,
                      borderColor: `${densityColor}40`
                    }}
                  >
                    {densityLabel}
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="block text-[10px] text-slate-400 font-medium">Total</span>
                    <span className="font-bold text-slate-800 text-sm">{totalIssues}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50">
                    <span className="block text-[10px] text-amber-600 font-medium">Active</span>
                    <span className="font-bold text-amber-700 text-sm">{activeIssues}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-red-50">
                    <span className="block text-[10px] text-red-600 font-medium">Critical</span>
                    <span className="font-bold text-red-700 text-sm">{criticalIssues}</span>
                  </div>
                </div>

                {/* Top Categories in this Zone */}
                {topCategories.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                      Prominent Issue Types
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {topCategories.map(cat => (
                        <span
                          key={cat.name}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
                        >
                          {cat.name} ({cat.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Included Facilities */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    Covered Facilities
                  </span>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {zone.buildings.join(', ')}
                  </p>
                </div>

                {/* Focus Zone Action */}
                {onSelectZone && (
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onSelectZone(zone)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-white transition-all shadow-sm"
                      style={{ backgroundColor: zone.color }}
                    >
                      <span>Focus on {zone.shortName}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          </Circle>
        );
      })}
    </>
  );
};

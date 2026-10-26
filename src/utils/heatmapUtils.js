import { getIssueCoordinates } from './mapIcons.js';

export const HEATMAP_GRADIENTS = {
  standard: {
    0.15: '#3b82f6', // Blue
    0.35: '#06b6d4', // Cyan
    0.55: '#10b981', // Emerald / Green
    0.75: '#f59e0b', // Amber / Yellow
    0.95: '#ef4444'  // Red
  },
  inferno: {
    0.2: '#fde047', // Yellow
    0.4: '#fb923c', // Orange
    0.6: '#f87171', // Coral Red
    0.8: '#dc2626', // Crimson
    1.0: '#7f1d1d'  // Dark Red
  },
  neon: {
    0.2: '#8b5cf6', // Violet
    0.4: '#3b82f6', // Indigo
    0.6: '#06b6d4', // Cyan
    0.8: '#ec4899', // Pink
    1.0: '#f43f5e'  // Rose
  }
};

/**
 * Transforms a list of issue documents into an array of Leaflet Heat points:
 * [latitude, longitude, intensity (0.0 to 1.0)]
 */
export function formatIssuesToHeatPoints(issues = [], options = {}) {
  const {
    weightMode = 'severity', // 'severity' | 'count' | 'active_only'
    boostCritical = true,
    minIntensity = 0.2
  } = options;

  return issues
    .map(issue => {
      const coords = getIssueCoordinates(issue);
      if (!coords || isNaN(coords[0]) || isNaN(coords[1])) return null;

      const isResolved = issue.status === 'RESOLVED' || issue.status === 'CLOSED';

      // If active_only and issue is resolved, scale down or filter
      if (weightMode === 'active_only' && isResolved) {
        return null;
      }

      let intensity = 0.5;

      if (weightMode === 'severity') {
        switch (issue.priorityLevel) {
          case 'CRITICAL':
            intensity = boostCritical ? 1.0 : 0.9;
            break;
          case 'HIGH':
            intensity = 0.75;
            break;
          case 'MEDIUM':
            intensity = 0.45;
            break;
          case 'LOW':
            intensity = 0.25;
            break;
          default:
            intensity = 0.4;
        }

        // Dampen resolved issues slightly
        if (isResolved) {
          intensity *= 0.35;
        }
      } else if (weightMode === 'count') {
        // Pure spatial count density
        intensity = isResolved ? 0.3 : 0.65;
      }

      return [coords[0], coords[1], Math.max(minIntensity, Math.min(1.0, intensity))];
    })
    .filter(Boolean);
}

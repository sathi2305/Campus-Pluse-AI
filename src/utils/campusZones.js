import { CAMPUS_CENTER } from './mapIcons.js';

/**
 * Predefined spatial zones across the campus.
 * Each zone defines a center point, radius in meters, associated buildings,
 * color theme, and icon representation.
 */
export const CAMPUS_ZONES = [
  {
    id: 'zone-hostels',
    name: 'Hostels & Residential Zone',
    shortName: 'Hostel Zone',
    category: 'Residential',
    center: [11.0182, 76.9538],
    radius: 170, // meters
    buildings: ['Hostel A', 'Hostel B', 'Hostel C', 'Hostel D', 'Mess Block', 'Dining Hall', 'Hostel Office'],
    color: '#f97316',
    icon: '🛏️',
    description: 'Student accommodation blocks, residential facilities, mess hall and laundries.'
  },
  {
    id: 'zone-academic',
    name: 'Academic & Engineering Zone',
    shortName: 'Academic Block',
    category: 'Academic',
    center: [11.0162, 76.9572],
    radius: 190,
    buildings: ['Engineering Block', 'CS Block', 'Academic Block', 'Seminar Hall', 'Lecture Hall Complex', 'Auditorium'],
    color: '#3b82f6',
    icon: '📚',
    description: 'Lecture theatres, faculty rooms, department auditoriums and teaching halls.'
  },
  {
    id: 'zone-labs',
    name: 'Laboratories & Research Complex',
    shortName: 'Labs Complex',
    category: 'Research',
    center: [11.0152, 76.9585],
    radius: 140,
    buildings: ['Electronics Lab', 'Chemistry Lab', 'Physics Lab', 'Mechanical Workshop', 'Innovation Lab', 'Robotics Lab'],
    color: '#8b5cf6',
    icon: '🔬',
    description: 'Experimental laboratories, research centers, workshops and sensitive computing labs.'
  },
  {
    id: 'zone-library',
    name: 'Central Library & Study Commons',
    shortName: 'Library',
    category: 'Learning',
    center: [11.0175, 76.9565],
    radius: 120,
    buildings: ['Central Library', 'Library', 'Digital Commons', 'Reading Room', 'Archives'],
    color: '#06b6d4',
    icon: '📖',
    description: 'Reference library, digital learning commons, quiet study zones and media center.'
  },
  {
    id: 'zone-canteen',
    name: 'Food Court & Student Center',
    shortName: 'Food & Dining',
    category: 'Dining',
    center: [11.0169, 76.9548],
    radius: 110,
    buildings: ['Canteen', 'Cafeteria', 'Food Court', 'Student Activity Center', 'Co-op Store'],
    color: '#ec4899',
    icon: '🍲',
    description: 'Central cafeteria, snack kiosks, student union hub and student amenities.'
  },
  {
    id: 'zone-admin',
    name: 'Administration & Campus Gateway',
    shortName: 'Admin & Gate',
    category: 'Administrative',
    center: [11.0148, 76.9542],
    radius: 150,
    buildings: ['Admin Block', 'Main Gate', 'Security Office', 'Finance Office', 'Admissions', 'Registrar'],
    color: '#10b981',
    icon: '🏛️',
    description: 'Administrative offices, main campus entrance, visitor reception and security command.'
  },
  {
    id: 'zone-transit',
    name: 'Sports Grounds & Transit Hub',
    shortName: 'Sports & Transit',
    category: 'Recreation & Transit',
    center: [11.0192, 76.9575],
    radius: 180,
    buildings: ['Transport Hub', 'Bus Bay', 'Sports Complex', 'Gymnasium', 'Stadium', 'Parking Area'],
    color: '#14b8a6',
    icon: '🚌',
    description: 'Campus bus terminal, vehicle parking zones, sports fields and fitness facilities.'
  }
];

/**
 * Calculates distance between two geographical points using Haversine formula (in meters)
 */
export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Maps an issue to a campus zone based on:
 * 1. Building name matching
 * 2. Spatial proximity to zone center
 */
export function matchIssueToZone(issue, zones = CAMPUS_ZONES) {
  const building = issue?.location?.building?.toLowerCase() || '';

  // 1. Direct building name match
  if (building) {
    for (const zone of zones) {
      if (zone.buildings.some(b => building.includes(b.toLowerCase()) || b.toLowerCase().includes(building))) {
        return zone;
      }
    }
  }

  // 2. Spatial distance match
  const coords = issue?.location?.coordinates;
  if (coords?.lat && coords?.lng) {
    let closestZone = null;
    let minDistance = Infinity;

    for (const zone of zones) {
      const dist = getDistanceMeters(coords.lat, coords.lng, zone.center[0], zone.center[1]);
      if (dist < zone.radius * 1.5 && dist < minDistance) {
        minDistance = dist;
        closestZone = zone;
      }
    }

    if (closestZone) return closestZone;
  }

  // Default fallback to the Academic zone or the first zone
  return zones[1] || zones[0];
}

/**
 * Computes density statistics and risk scores for all campus zones given a list of issues
 */
export function computeZoneDensityStats(issues = [], zones = CAMPUS_ZONES) {
  const zoneStatsMap = {};

  // Initialize
  zones.forEach(zone => {
    zoneStatsMap[zone.id] = {
      zone,
      totalIssues: 0,
      activeIssues: 0,
      criticalIssues: 0,
      highIssues: 0,
      resolvedIssues: 0,
      categoriesCount: {},
      densityScore: 0,
      densityLevel: 'CLEAR', // 'CLEAR', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
      issues: []
    };
  });

  // Aggregate issues
  issues.forEach(issue => {
    const zone = matchIssueToZone(issue, zones);
    if (!zone || !zoneStatsMap[zone.id]) return;

    const stats = zoneStatsMap[zone.id];
    stats.totalIssues += 1;
    stats.issues.push(issue);

    const isResolved = issue.status === 'RESOLVED' || issue.status === 'CLOSED';
    if (isResolved) {
      stats.resolvedIssues += 1;
    } else {
      stats.activeIssues += 1;
      if (issue.priorityLevel === 'CRITICAL') stats.criticalIssues += 1;
      else if (issue.priorityLevel === 'HIGH') stats.highIssues += 1;
    }

    // Category breakdown
    const cat = issue.category || 'Other';
    stats.categoriesCount[cat] = (stats.categoriesCount[cat] || 0) + 1;
  });

  // Calculate density score (0 - 100 scale) and assign density category
  return Object.values(zoneStatsMap).map(stats => {
    // Formula: active issues with heavy weighting on Critical and High
    const weightedSum =
      stats.criticalIssues * 4.0 +
      stats.highIssues * 2.5 +
      (stats.activeIssues - stats.criticalIssues - stats.highIssues) * 1.0;

    // Normalization factor based on typical zone capacity
    const score = Math.min(100, Math.round(weightedSum * 7.5));
    stats.densityScore = score;

    if (score >= 65 || stats.criticalIssues >= 2) {
      stats.densityLevel = 'CRITICAL';
      stats.densityColor = '#ef4444'; // Red
      stats.densityLabel = 'Critical Density';
    } else if (score >= 40 || stats.activeIssues >= 4) {
      stats.densityLevel = 'HIGH';
      stats.densityColor = '#f97316'; // Orange
      stats.densityLabel = 'High Density';
    } else if (score >= 18 || stats.activeIssues >= 2) {
      stats.densityLevel = 'MODERATE';
      stats.densityColor = '#eab308'; // Amber/Yellow
      stats.densityLabel = 'Moderate Density';
    } else if (stats.activeIssues > 0 || stats.totalIssues > 0) {
      stats.densityLevel = 'LOW';
      stats.densityColor = '#10b981'; // Green
      stats.densityLabel = 'Low Density';
    } else {
      stats.densityLevel = 'CLEAR';
      stats.densityColor = '#64748b'; // Slate
      stats.densityLabel = 'Optimal / Clear';
    }

    // Top categories in this zone
    stats.topCategories = Object.entries(stats.categoriesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    return stats;
  }).sort((a, b) => b.densityScore - a.densityScore);
}

import L from 'leaflet';

export const CAMPUS_CENTER = [11.0168, 76.9558];
export const DEFAULT_ZOOM = 16;

const PRIORITY_THEMES = {
  CRITICAL: {
    bg: '#ef4444',
    text: '#ffffff',
    border: '#b91c1c',
    ring: 'rgba(239, 68, 68, 0.4)'
  },
  HIGH: {
    bg: '#f97316',
    text: '#ffffff',
    border: '#c2410c',
    ring: 'rgba(249, 115, 22, 0.35)'
  },
  MEDIUM: {
    bg: '#3b82f6',
    text: '#ffffff',
    border: '#1d4ed8',
    ring: 'rgba(59, 130, 246, 0.3)'
  },
  LOW: {
    bg: '#10b981',
    text: '#ffffff',
    border: '#047857',
    ring: 'rgba(16, 185, 129, 0.3)'
  },
  RESOLVED: {
    bg: '#64748b',
    text: '#ffffff',
    border: '#475569',
    ring: 'rgba(100, 116, 139, 0.25)'
  }
};

const CATEGORY_SYMBOLS = {
  Water: '💧',
  Electricity: '⚡',
  Internet: '📶',
  Hostel: '🛏️',
  Transport: '🚌',
  Food: '🍲',
  Security: '🛡️',
  Cleanliness: '🧹',
  Infrastructure: '🏗️',
  Academic: '📚',
  Laboratory: '🔬',
  Library: '📖',
  Administration: '🏛️',
  Other: '📍'
};

export const getIssueCoordinates = (issue) => {
  if (issue?.location?.coordinates?.lat && issue?.location?.coordinates?.lng) {
    const lat = Number(issue.location.coordinates.lat);
    const lng = Number(issue.location.coordinates.lng);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return [lat, lng];
    }
  }

  // Fallback: deterministic offset around campus center based on building / id
  const str = (issue?.location?.building || '') + (issue?._id || issue?.id || 'issue');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const offsetLat = ((hash % 1000) / 100000);
  const offsetLng = (((hash >> 3) % 1000) / 100000);
  return [CAMPUS_CENTER[0] + offsetLat, CAMPUS_CENTER[1] + offsetLng];
};

export const createIssueMarkerIcon = (issue, isSelected = false) => {
  const isResolved = issue?.status === 'RESOLVED' || issue?.status === 'CLOSED';
  const priorityKey = isResolved ? 'RESOLVED' : (issue?.priorityLevel || 'MEDIUM');
  const theme = PRIORITY_THEMES[priorityKey] || PRIORITY_THEMES.MEDIUM;
  const isCritical = !isResolved && issue?.priorityLevel === 'CRITICAL';
  const symbol = CATEGORY_SYMBOLS[issue?.category] || '📍';
  
  const size = isSelected ? 44 : 36;
  const anchorY = isSelected ? 44 : 36;

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-110 z-50' : 'hover:scale-110'}" style="width:${size}px; height:${size}px;">
      ${isCritical ? `
        <span class="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75" style="background-color: ${theme.ring};"></span>
      ` : ''}
      <div class="relative flex items-center justify-center rounded-full shadow-lg border-2 text-white font-bold"
           style="width:${size}px; height:${size}px; background-color: ${theme.bg}; border-color: ${isSelected ? '#ffffff' : theme.border}; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
        <span style="font-size: ${isSelected ? '18px' : '15px'}; line-height: 1;">${symbol}</span>
      </div>
      <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border-r-2 border-b-2"
           style="background-color: ${theme.bg}; border-color: ${isSelected ? '#ffffff' : theme.border};"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-campus-marker',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, anchorY + 4],
    popupAnchor: [0, -anchorY - 4]
  });
};

export const createLocationPickerIcon = () => {
  const html = `
    <div class="relative flex items-center justify-center" style="width:36px; height:36px;">
      <span class="absolute inline-flex h-full w-full rounded-full animate-ping opacity-70 bg-indigo-400"></span>
      <div class="relative flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white shadow-xl border-2 border-white font-bold">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-indigo-600 border-r-2 border-b-2 border-white"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-picker-marker',
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 38],
    popupAnchor: [0, -38]
  });
};

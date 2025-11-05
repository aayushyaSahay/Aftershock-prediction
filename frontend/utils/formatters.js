import { formatDistanceToNow, format, parseISO } from 'date-fns';

// Format magnitude
export const formatMagnitude = (magnitude) => {
  return `M${magnitude.toFixed(1)}`;
};

// Format depth
export const formatDepth = (depth) => {
  return `${Math.round(depth)} km`;
};

// Format coordinates
export const formatCoordinates = (lat, lon) => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
};

// Format time ago
export const formatTimeAgo = (timestamp) => {
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'Unknown time';
  }
};

// Format full date
export const formatFullDate = (timestamp) => {
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
    return format(date, 'PPpp');
  } catch (error) {
    return 'Invalid date';
  }
};

// Get magnitude color
export const getMagnitudeColor = (magnitude) => {
  if (magnitude >= 7.0) return '#dc2626'; // Critical red
  if (magnitude >= 6.0) return '#f59e0b'; // High orange
  if (magnitude >= 5.0) return '#fbbf24'; // Elevated yellow
  return '#10b981'; // Moderate green
};

// Get risk level color
export const getRiskLevelColor = (level) => {
  const colors = {
    CRITICAL: '#dc2626',
    HIGH: '#f59e0b',
    ELEVATED: '#fbbf24',
    MODERATE: '#10b981',
  };
  return colors[level] || '#4b5563';
};

// Format probability percentage
export const formatProbability = (probability) => {
  return `${(probability * 100).toFixed(1)}%`;
};

// Format number with commas
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
};

// Truncate place name
export const truncatePlace = (place, maxLength = 50) => {
  if (!place) return 'Unknown location';
  if (place.length <= maxLength) return place;
  return place.substring(0, maxLength) + '...';
};

// Get quality badge color
export const getQualityColor = (quality) => {
  const colors = {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#dc2626',
    unknown: '#4b5563',
  };
  return colors[quality?.toLowerCase()] || colors.unknown;
};

// Format model quality
export const formatQuality = (quality) => {
  if (!quality) return 'Unknown';
  return quality.charAt(0).toUpperCase() + quality.slice(1).toLowerCase();
};
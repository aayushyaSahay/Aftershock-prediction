import { AlertTriangle, Activity, Clock, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { formatTimeAgo } from '@/utils/formatters';

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get direction from location to earthquake
function getDirection(lat1, lon1, lat2, lon2) {
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = Math.atan2(y, x) * 180 / Math.PI;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((bearing + 360) % 360) / 45) % 8;
  return directions[index];
}

// Calculate magnitude-based radius (larger earthquakes have wider affected area)
function getMagnitudeBasedRadius(magnitude) {
  return Math.max(500, Math.min(1500, magnitude * 100)); // 500km to 1500km
}

// Filter earthquakes by radius and add distance/direction
function filterEarthquakesByRadius(earthquakes, lat, lon, radiusKm) {
  return earthquakes
    .map(eq => ({
      ...eq,
      distance: calculateDistance(lat, lon, eq.latitude, eq.longitude),
      direction: getDirection(lat, lon, eq.latitude, eq.longitude)
    }))
    .filter(eq => eq.distance <= radiusKm)
    .sort((a, b) => new Date(b.time) - new Date(a.time));
}

// Separate earthquakes into before/after mainshock
function separateBeforeAfter(earthquakes, mainshockTime, mainshockId) {
  const mainshockDate = new Date(mainshockTime);
  
  return earthquakes.reduce((acc, eq) => {
    // Skip the mainshock itself
    if (eq.id === mainshockId) return acc;
    
    const eqDate = new Date(eq.time);
    if (eqDate < mainshockDate) {
      acc.before.push(eq);
    } else {
      acc.after.push(eq);
    }
    return acc;
  }, { before: [], after: [] });
}

// Identify potential foreshocks (M >= 3.5 within 7 days before)
function identifyForeshocks(beforeEarthquakes, mainshockTime) {
  const mainshockDate = new Date(mainshockTime);
  const sevenDaysBefore = new Date(mainshockDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return beforeEarthquakes
    .filter(eq => {
      const eqDate = new Date(eq.time);
      return eqDate >= sevenDaysBefore && eq.magnitude >= 3.5;
    })
    .sort((a, b) => b.magnitude - a.magnitude)
    .slice(0, 5); // Top 5 foreshocks
}

// Generate activity heatmap for 7 days before mainshock
function generateBeforeHeatmap(earthquakes, mainshockTime) {
  const mainshockDate = new Date(mainshockTime);
  const heatmap = Array(7).fill(0);
  
  earthquakes.forEach(eq => {
    const eqTime = new Date(eq.time);
    const daysBeforeMainshock = Math.floor((mainshockDate - eqTime) / (1000 * 60 * 60 * 24));
    if (daysBeforeMainshock >= 0 && daysBeforeMainshock < 7) {
      heatmap[6 - daysBeforeMainshock]++;
    }
  });
  
  return heatmap;
}

// Calculate time difference with sign
function getTimeDifference(earthquakeTime, mainshockTime) {
  const eqDate = new Date(earthquakeTime);
  const mainDate = new Date(mainshockTime);
  const diffMs = eqDate - mainDate;
  const diffDays = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const diffHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
  
  if (diffMs < 0) {
    // Before mainshock
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} before`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} before`;
    } else {
      return 'Shortly before';
    }
  } else {
    // After mainshock (aftershock)
    return formatTimeAgo(earthquakeTime);
  }
}

// Determine activity level for before period
function getBeforeActivityLevel(count, avgMag) {
  if (count > 25 || avgMag > 4.5) {
    return { level: 'HIGH', color: '#dc2626', icon: '🔴', bgColor: '#fee2e2' };
  } else if (count > 15 || avgMag > 4.0) {
    return { level: 'ELEVATED', color: '#f59e0b', icon: '🟠', bgColor: '#fef3c7' };
  } else if (count > 5) {
    return { level: 'MODERATE', color: '#fbbf24', icon: '🟡', bgColor: '#fef9c3' };
  } else {
    return { level: 'LOW', color: '#10b981', icon: '🟢', bgColor: '#d1fae5' };
  }
}

export default function EarthquakeActivityCard({ earthquake, allEarthquakes }) {
  // Calculate magnitude-based radius
  const radius = getMagnitudeBasedRadius(earthquake.magnitude);
  
  // Filter earthquakes within radius
  const nearbyEarthquakes = filterEarthquakesByRadius(
    allEarthquakes,
    earthquake.latitude,
    earthquake.longitude,
    radius
  );
  
  // Separate into before/after
  const { before, after } = separateBeforeAfter(
    nearbyEarthquakes,
    earthquake.time,
    earthquake.id
  );
  
  // Filter before to 7 days prior
  const mainshockDate = new Date(earthquake.time);
  const sevenDaysBefore = new Date(mainshockDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const before7d = before.filter(eq => new Date(eq.time) >= sevenDaysBefore);
  
  // Calculate metrics
  const countBefore = before7d.length;
  const avgMagBefore = countBefore > 0 
    ? before7d.reduce((sum, eq) => sum + eq.magnitude, 0) / countBefore 
    : 0;
  
  const countAfter = after.length;
  const avgMagAfter = countAfter > 0
    ? after.reduce((sum, eq) => sum + eq.magnitude, 0) / countAfter
    : 0;
  
  // Identify foreshocks
  const foreshocks = identifyForeshocks(before, earthquake.time);
  
  // Activity level for before period
  const beforeActivityLevel = getBeforeActivityLevel(countBefore, avgMagBefore);
  
  // Generate heatmap for 7 days before
  const heatmapData = generateBeforeHeatmap(before7d, earthquake.time);
  
  // Heatmap colors
  const maxCount = Math.max(...heatmapData, 1);
  const getHeatmapColor = (count) => {
    if (count === 0) return '#f3f4f6';
    const intensity = count / maxCount;
    if (intensity > 0.75) return '#dc2626';
    if (intensity > 0.5) return '#f59e0b';
    if (intensity > 0.25) return '#fbbf24';
    return '#10b981';
  };
  
  // Largest aftershock
  const largestAftershock = after.length > 0 
    ? after.reduce((max, eq) => eq.magnitude > max.magnitude ? eq : max, after[0])
    : null;
  
  return (
    <div className="bg-white border-b-2 border-gray-200">
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Seismic Activity Analysis</h3>
          </div>
          <div className="text-xs text-gray-500">
            Within {radius}km radius
          </div>
        </div>
        
        {/* Before Mainshock Section */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-4 h-4 text-blue-600" />
            <div className="text-sm font-semibold text-gray-900">
              Before Mainshock (7 days prior)
            </div>
          </div>
          
          <div 
            className="rounded-xl p-4 border-2"
            style={{ 
              backgroundColor: beforeActivityLevel.bgColor,
              borderColor: beforeActivityLevel.color 
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{beforeActivityLevel.icon}</span>
                <div>
                  <div 
                    className="text-lg font-bold"
                    style={{ color: beforeActivityLevel.color }}
                  >
                    {beforeActivityLevel.level} ACTIVITY
                  </div>
                  <div className="text-xs text-gray-600">
                    Pre-mainshock seismicity
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white/70 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Events</div>
                <div className="text-2xl font-bold text-gray-900">{countBefore}</div>
                <div className="text-xs text-gray-600">in 7 days</div>
              </div>
              <div className="bg-white/70 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Average</div>
                <div className="text-2xl font-bold text-gray-900">
                  M{avgMagBefore > 0 ? avgMagBefore.toFixed(1) : '0.0'}
                </div>
                <div className="text-xs text-gray-600">magnitude</div>
              </div>
            </div>
            
            {/* Heatmap */}
            <div className="bg-white/70 rounded-lg p-3">
              <div className="text-xs font-medium text-gray-700 mb-2">
                Activity Pattern (7 days before)
              </div>
              <div className="flex space-x-1">
                {heatmapData.map((count, idx) => (
                  <div key={idx} className="flex-1">
                    <div
                      className="w-full aspect-square rounded"
                      style={{ backgroundColor: getHeatmapColor(count) }}
                      title={`${7-idx} days before: ${count} events`}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-7d</span>
                <span>Mainshock</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Foreshocks Detection */}
        {foreshocks.length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-5 h-5 text-yellow-600" />
              <div className="text-sm font-semibold text-gray-900">
                Potential Foreshocks Detected
              </div>
            </div>
            <div className="text-xs text-gray-700 mb-3">
              Significant earthquakes (M≥3.5) in the 7 days before mainshock:
            </div>
            <div className="space-y-2">
              {foreshocks.slice(0, 3).map((eq, idx) => (
                <div 
                  key={idx}
                  className="flex items-start justify-between bg-white/70 rounded-lg p-2 text-sm"
                >
                  <div className="flex-1">
                    <div className="font-bold text-yellow-700">
                      M{eq.magnitude.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {eq.distance.toFixed(0)}km {eq.direction}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 text-right">
                    {getTimeDifference(eq.time, earthquake.time)}
                  </div>
                </div>
              ))}
            </div>
            {foreshocks.length > 3 && (
              <div className="text-xs text-gray-600 mt-2 text-center">
                +{foreshocks.length - 3} more foreshock{foreshocks.length - 3 > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
        
        {/* After Mainshock Section */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <TrendingDown className="w-4 h-4 text-orange-600" />
            <div className="text-sm font-semibold text-gray-900">
              After Mainshock (Aftershocks)
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Detected</div>
                <div className="text-2xl font-bold text-orange-600">{countAfter}</div>
                <div className="text-xs text-gray-600">aftershocks</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Average</div>
                <div className="text-2xl font-bold text-orange-600">
                  M{avgMagAfter > 0 ? avgMagAfter.toFixed(1) : '0.0'}
                </div>
                <div className="text-xs text-gray-600">magnitude</div>
              </div>
            </div>
            
            {largestAftershock && (
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Largest Aftershock</div>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg text-orange-600">
                    M{largestAftershock.magnitude.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatTimeAgo(largestAftershock.time)}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {largestAftershock.distance.toFixed(0)}km {largestAftershock.direction}
                </div>
              </div>
            )}
            
            {countAfter === 0 && (
              <div className="text-sm text-gray-600 text-center">
                No aftershocks detected yet in available data
              </div>
            )}
          </div>
        </div>
        
        {/* Comparison */}
        {countBefore > 0 && countAfter > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-900 mb-2">
              Activity Comparison
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Seismicity increase:</span>
              <span className="font-bold text-blue-600">
                {(countAfter / Math.max(countBefore, 1)).toFixed(1)}x
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Aftershock sequence shows {countAfter > countBefore * 5 ? 'significant' : 'expected'} activity increase
            </div>
          </div>
        )}
        
        {/* Note */}
        <div className="text-xs text-gray-500 italic">
          Analysis based on M≥4.0 earthquakes within {radius}km radius
        </div>
      </div>
    </div>
  );
}

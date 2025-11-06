import { AlertTriangle, Activity, MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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

// Filter earthquakes by radius
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

// Generate activity heatmap data (last 7 days)
function generateHeatmapData(earthquakes) {
  const now = new Date();
  const heatmap = Array(7).fill(0);
  
  earthquakes.forEach(eq => {
    const eqTime = new Date(eq.time);
    const daysAgo = Math.floor((now - eqTime) / (1000 * 60 * 60 * 24));
    if (daysAgo >= 0 && daysAgo < 7) {
      heatmap[6 - daysAgo]++;
    }
  });
  
  return heatmap;
}

// Determine activity level
function getActivityLevel(count7d, avgMag7d) {
  if (count7d > 50 || avgMag7d > 5.5) {
    return { level: 'HIGH', color: '#dc2626', icon: '🔴', bgColor: '#fee2e2' };
  } else if (count7d > 25 || avgMag7d > 5.0) {
    return { level: 'ELEVATED', color: '#f59e0b', icon: '🟠', bgColor: '#fef3c7' };
  } else if (count7d > 10 || avgMag7d > 4.5) {
    return { level: 'MODERATE', color: '#fbbf24', icon: '🟡', bgColor: '#fef9c3' };
  } else {
    return { level: 'LOW', color: '#10b981', icon: '🟢', bgColor: '#d1fae5' };
  }
}

// Find last earthquake at this specific location (within 50km)
function findLastEarthquakeHere(earthquakes, lat, lon) {
  const nearby = earthquakes
    .filter(eq => calculateDistance(lat, lon, eq.latitude, eq.longitude) <= 50)
    .sort((a, b) => new Date(b.time) - new Date(a.time));
  
  return nearby.length > 0 ? nearby[0] : null;
}

export default function RealTimeActivityCard({ location, allEarthquakes }) {
  // Filter earthquakes within 500km
  const nearbyEarthquakes = filterEarthquakesByRadius(
    allEarthquakes,
    location.latitude,
    location.longitude,
    500
  );
  
  // Calculate metrics for last 7 and 30 days
  const now = new Date();
  const last7Days = nearbyEarthquakes.filter(eq => 
    (now - new Date(eq.time)) / (1000 * 60 * 60 * 24) <= 7
  );
  const last30Days = nearbyEarthquakes.filter(eq => 
    (now - new Date(eq.time)) / (1000 * 60 * 60 * 24) <= 30
  );
  
  const count7d = last7Days.length;
  const count30d = last30Days.length;
  
  const avgMag7d = count7d > 0 
    ? last7Days.reduce((sum, eq) => sum + eq.magnitude, 0) / count7d 
    : 0;
  const avgMag30d = count30d > 0 
    ? last30Days.reduce((sum, eq) => sum + eq.magnitude, 0) / count30d 
    : 0;
  
  // Activity level
  const activityLevel = getActivityLevel(count7d, avgMag7d);
  
  // Trend
  const weeklyAverage = count30d / 4.3; // ~4.3 weeks in 30 days
  const trend = count7d > weeklyAverage * 1.2 ? 'increasing' :
                count7d < weeklyAverage * 0.8 ? 'decreasing' : 'stable';
  
  // Heatmap data
  const heatmapData = generateHeatmapData(last7Days);
  
  // Last earthquake at this location
  const lastHere = findLastEarthquakeHere(allEarthquakes, location.latitude, location.longitude);
  
  // Top 3 nearest events
  const nearestEvents = nearbyEarthquakes.slice(0, 3);
  
  // Heatmap intensity
  const maxCount = Math.max(...heatmapData, 1);
  const getHeatmapColor = (count) => {
    if (count === 0) return '#f3f4f6';
    const intensity = count / maxCount;
    if (intensity > 0.75) return '#dc2626';
    if (intensity > 0.5) return '#f59e0b';
    if (intensity > 0.25) return '#fbbf24';
    return '#10b981';
  };
  
  return (
    <div className="bg-white border-b-2 border-gray-200">
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">Real-Time Seismic Activity</h3>
          </div>
        </div>
        
        {/* Activity Level Alert */}
        <div 
          className="rounded-xl p-4 border-2"
          style={{ 
            backgroundColor: activityLevel.bgColor,
            borderColor: activityLevel.color 
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{activityLevel.icon}</span>
              <div>
                <div 
                  className="text-lg font-bold"
                  style={{ color: activityLevel.color }}
                >
                  {activityLevel.level} ACTIVITY
                </div>
                <div className="text-xs text-gray-600">
                  Within 500km radius
                </div>
              </div>
            </div>
            {activityLevel.level !== 'LOW' && (
              <AlertTriangle className="w-6 h-6" style={{ color: activityLevel.color }} />
            )}
          </div>
          
          {/* Comparison Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/70 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Last 7 Days</div>
              <div className="text-2xl font-bold text-gray-900">{count7d}</div>
              <div className="text-xs text-gray-600">events</div>
              <div className="text-sm font-medium text-gray-700 mt-1">
                Avg: M{avgMag7d.toFixed(1)}
              </div>
            </div>
            <div className="bg-white/70 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Last 30 Days</div>
              <div className="text-2xl font-bold text-gray-900">{count30d}</div>
              <div className="text-xs text-gray-600">events</div>
              <div className="text-sm font-medium text-gray-700 mt-1">
                Avg: M{avgMag30d.toFixed(1)}
              </div>
            </div>
          </div>
          
          {/* Trend Indicator */}
          <div className="mt-3 flex items-center space-x-2 text-sm">
            {trend === 'increasing' && (
              <>
                <TrendingUp className="w-4 h-4 text-red-500" />
                <span className="font-medium text-red-600">Increasing trend</span>
              </>
            )}
            {trend === 'decreasing' && (
              <>
                <TrendingDown className="w-4 h-4 text-green-500" />
                <span className="font-medium text-green-600">Decreasing trend</span>
              </>
            )}
            {trend === 'stable' && (
              <>
                <Minus className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-600">Stable trend</span>
              </>
            )}
          </div>
        </div>
        
        {/* Activity Heatmap */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-sm font-semibold text-gray-900 mb-3">
            7-Day Activity Pattern
          </div>
          <div className="flex space-x-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div key={day} className="flex-1">
                <div className="text-xs text-gray-500 text-center mb-1">{day[0]}</div>
                <div
                  className="w-full aspect-square rounded"
                  style={{ backgroundColor: getHeatmapColor(heatmapData[idx]) }}
                  title={`${day}: ${heatmapData[idx]} events`}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>Less</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f3f4f6' }}></div>
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#dc2626' }}></div>
            </div>
            <span>More</span>
          </div>
        </div>
        
        {/* Last Earthquake at This Location */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <div className="text-sm font-semibold text-gray-900">
              Last Earthquake at This Location
            </div>
          </div>
          {lastHere ? (
            <div className="text-sm text-gray-700">
              <span className="font-bold text-blue-600">M{lastHere.magnitude.toFixed(1)}</span>
              {' '}- {formatTimeAgo(lastHere.time)}
              {lastHere.depth && (
                <span className="text-gray-500"> ({lastHere.depth.toFixed(0)}km depth)</span>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              No recent earthquakes within 50km
            </div>
          )}
        </div>
        
        {/* Nearest Recent Events */}
        {nearestEvents.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-900">
              Nearest Recent Events
            </div>
            {nearestEvents.map((eq, idx) => (
              <div 
                key={idx}
                className="flex items-start justify-between bg-gray-50 rounded-lg p-3 text-sm"
              >
                <div className="flex-1">
                  <div className="font-bold text-orange-600">
                    M{eq.magnitude.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {eq.distance.toFixed(0)}km {eq.direction} · {formatTimeAgo(eq.time)}
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  {eq.place?.split(',')[0] || 'Unknown location'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

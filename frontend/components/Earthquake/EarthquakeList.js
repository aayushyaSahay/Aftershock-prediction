import { formatMagnitude, formatTimeAgo, getMagnitudeColor, truncatePlace } from '@/utils/formatters';
import { ChevronRight, MapPin } from 'lucide-react';

export default function EarthquakeList({ earthquakes, selectedEarthquake, onEarthquakeClick }) {
  if (!earthquakes || earthquakes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 bg-white">
        <div className="text-center space-y-3 p-6">
          <MapPin className="w-12 h-12 mx-auto opacity-30" />
          <p className="text-gray-600">No earthquakes found</p>
          <p className="text-sm text-gray-400">Try adjusting the time filter</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-y-auto p-3 space-y-2 bg-white">
      {earthquakes.map((eq) => {
        const mag = eq.magnitude;
        const color = getMagnitudeColor(mag);
        const isSelected = selectedEarthquake?.id === eq.id;
        
        return (
          <button
            key={eq.id}
            onClick={() => onEarthquakeClick(eq)}
            className={`w-full text-left p-4 rounded-2xl transition-all transform hover:scale-[1.02] ${
              isSelected
                ? 'bg-orange-50 border-2 border-orange-500 shadow-sm'
                : 'bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between space-x-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="font-bold text-lg" style={{ color }}>
                    {formatMagnitude(mag)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-900 mb-1 truncate font-medium">
                  {truncatePlace(eq.place)}
                </div>
                
                <div className="text-xs text-gray-500">
                  {formatTimeAgo(eq.time)}
                </div>
              </div>
              
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
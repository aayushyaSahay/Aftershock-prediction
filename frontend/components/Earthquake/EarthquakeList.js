import { formatMagnitude, formatTimeAgo, getMagnitudeColor, truncatePlace } from '@/utils/formatters';
import { ChevronRight, MapPin } from 'lucide-react';

export default function EarthquakeList({ earthquakes, selectedEarthquake, onEarthquakeClick }) {
  if (!earthquakes || earthquakes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary">
        <div className="text-center space-y-2">
          <MapPin className="w-12 h-12 mx-auto opacity-50" />
          <p>No earthquakes found</p>
          <p className="text-sm">Try adjusting the time filter</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-y-auto space-y-2 p-4">
      <h2 className="text-lg font-semibold mb-4 sticky top-0 bg-bg-dark pt-2 pb-2 z-10">
        Recent Earthquakes ({earthquakes.length})
      </h2>
      
      {earthquakes.map((eq) => {
        const mag = eq.magnitude;
        const color = getMagnitudeColor(mag);
        const isSelected = selectedEarthquake?.id === eq.id;
        
        return (
          <button
            key={eq.id}
            onClick={() => onEarthquakeClick(eq)}
            className={`w-full text-left p-4 rounded-lg transition-all transform hover:scale-[1.02] ${
              isSelected
                ? 'bg-orange-500/20 border-2 border-orange-500'
                : 'bg-bg-card border border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-start justify-between space-x-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="font-bold text-lg" style={{ color }}>
                    {formatMagnitude(mag)}
                  </span>
                </div>
                
                <div className="text-sm text-white mb-1 truncate">
                  {truncatePlace(eq.place)}
                </div>
                
                <div className="text-xs text-text-secondary">
                  {formatTimeAgo(eq.time)}
                </div>
              </div>
              
              <ChevronRight className="w-5 h-5 text-text-secondary flex-shrink-0" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
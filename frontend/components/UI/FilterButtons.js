import { Calendar, Layers, Filter } from 'lucide-react';
import { useState } from 'react';

export default function FilterButtons({ timeFilter, setTimeFilter }) {
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  
  const timeFilters = [
    { label: 'Last 24 Hours', value: 1 },
    { label: 'Last Week', value: 7 },
    { label: 'Last Month', value: 30 },
    { label: 'Last Year', value: 365 },
  ];
  
  const selectedFilter = timeFilters.find(f => f.value === timeFilter);
  
  return (
    <div className="flex flex-col space-y-2">
      {/* Time Filter */}
      <div className="relative">
        <button
          onClick={() => setShowTimeFilter(!showTimeFilter)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-gray-300"
        >
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {selectedFilter?.label}
          </span>
        </button>
        
        {showTimeFilter && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowTimeFilter(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 z-20 min-w-[200px]">
              {timeFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setTimeFilter(filter.value);
                    setShowTimeFilter(false);
                  }}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    timeFilter === filter.value
                      ? 'bg-orange-50 text-orange-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Additional filter buttons can be added here */}
      <button
        className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-gray-300"
        title="Map layers"
      >
        <Layers className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}
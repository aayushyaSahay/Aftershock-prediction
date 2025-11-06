import { Calendar, Layers, Filter, Check } from 'lucide-react';
import { useState } from 'react';

export default function FilterButtons({ timeFilter, setTimeFilter, mapLayer, setMapLayer }) {
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [showLayerFilter, setShowLayerFilter] = useState(false);
  
  const timeFilters = [
    { label: 'Last 24 Hours', value: 1 },
    { label: 'Last Week', value: 7 },
    { label: 'Last Month', value: 30 },
    { label: 'Last Year', value: 365 },
  ];
  
  const mapLayers = [
    { label: 'Satellite', value: 'satellite', icon: '🛰️' },
    { label: 'Street Map', value: 'street', icon: '🗺️' },
    { label: 'Terrain', value: 'terrain', icon: '🏔️' },
    { label: 'Dark', value: 'dark', icon: '🌙' },
  ];
  
  const selectedFilter = timeFilters.find(f => f.value === timeFilter);
  const selectedLayer = mapLayers.find(l => l.value === mapLayer);
  
  return (
    <div className="flex flex-col space-y-2">
      {/* Time Filter */}
      <div className="relative">
        <button
          onClick={() => {
            setShowTimeFilter(!showTimeFilter);
            setShowLayerFilter(false);
          }}
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
                  className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between ${
                    timeFilter === filter.value
                      ? 'bg-orange-50 text-orange-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{filter.label}</span>
                  {timeFilter === filter.value && (
                    <Check className="w-4 h-4 text-orange-600" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Map Layers Button */}
      <div className="relative">
        <button
          onClick={() => {
            setShowLayerFilter(!showLayerFilter);
            setShowTimeFilter(false);
          }}
          className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-gray-300"
          title="Map layers"
        >
          <Layers className="w-5 h-5 text-gray-600" />
        </button>
        
        {showLayerFilter && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowLayerFilter(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 z-20 min-w-[180px]">
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Map Style
                </div>
                {mapLayers.map((layer) => (
                  <button
                    key={layer.value}
                    onClick={() => {
                      setMapLayer(layer.value);
                      setShowLayerFilter(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                      mapLayer === layer.value
                        ? 'bg-orange-50 text-orange-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{layer.icon}</span>
                      <span className="text-sm">{layer.label}</span>
                    </div>
                    {mapLayer === layer.value && (
                      <Check className="w-4 h-4 text-orange-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
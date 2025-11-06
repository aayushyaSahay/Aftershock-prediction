import { useState } from 'react';
import { Search, X, MapPin, TrendingUp } from 'lucide-react';

export default function SearchBar({ onLocationSearch, onShowList }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onLocationSearch(searchQuery);
    }
  };
  
  const recentSearches = [
    'California earthquakes',
    'Japan seismic activity',
    'Pacific Ring of Fire',
  ];
  
  return (
    <div className="relative">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div
          className={`flex items-center bg-white rounded-full shadow-lg transition-all duration-200 ${
            isFocused ? 'shadow-2xl ring-2 ring-orange-500/20' : ''
          }`}
        >
          {/* Recent earthquakes button */}
          <button
            type="button"
            onClick={onShowList}
            className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 rounded-l-full transition-colors border-r border-gray-200"
            title="Show recent earthquakes"
          >
            <TrendingUp className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Search Input */}
          <div className="flex-1 flex items-center px-4">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Search for location or earthquake..."
              className="flex-1 outline-none text-gray-900 placeholder-gray-400 bg-transparent py-3"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </form>
      
      {/* Search Suggestions Dropdown */}
      {isFocused && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
              Recent Searches
            </div>
            {recentSearches.map((search, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(search);
                  onLocationSearch(search);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{search}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
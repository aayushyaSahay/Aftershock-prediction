import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, TrendingUp, Loader2 } from 'lucide-react';

// Import API key from config
let GEOAPIFY_API_KEY = 'YOUR_GEOAPIFY_API_KEY_HERE';

// Try to import from config file, fallback to default if not available
try {
  const config = require('@/config/geoapify.config');
  if (config.GEOAPIFY_API_KEY) {
    GEOAPIFY_API_KEY = config.GEOAPIFY_API_KEY;
  }
} catch (e) {
  console.warn('Could not load geoapify config, using default');
}

// Define API URL directly
const GEOAPIFY_AUTOCOMPLETE_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';

export default function SearchBar({ onLocationSearch, onShowList }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);
  
  // Fetch autocomplete suggestions from Geoapify
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const url = `${GEOAPIFY_AUTOCOMPLETE_URL}?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}&limit=5`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const formattedSuggestions = data.features.map(feature => ({
          name: feature.properties.formatted,
          lat: feature.properties.lat,
          lon: feature.properties.lon,
          city: feature.properties.city || '',
          country: feature.properties.country || '',
          type: feature.properties.result_type || 'place',
        }));
        setSuggestions(formattedSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Unable to fetch location suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    if (searchQuery.trim().length >= 3) {
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 300);
    } else {
      setSuggestions([]);
    }
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  };
  
  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.name);
    onLocationSearch({
      name: suggestion.name,
      latitude: suggestion.lat,
      longitude: suggestion.lon,
    });
    setSuggestions([]);
    setIsFocused(false);
  };
  
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleClear = () => {
    setSearchQuery('');
    setSuggestions([]);
    setError(null);
  };
  
  // Get icon for result type
  const getResultIcon = (type) => {
    switch (type) {
      case 'city':
      case 'locality':
        return '🏙️';
      case 'country':
        return '🌍';
      case 'state':
      case 'county':
        return '📍';
      case 'postcode':
        return '✉️';
      default:
        return '📌';
    }
  };
  
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
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Search for location or earthquake..."
              className="flex-1 outline-none text-gray-900 placeholder-gray-400 bg-transparent py-3"
            />
            {loading && (
              <Loader2 className="w-4 h-4 text-orange-500 animate-spin mr-2" />
            )}
            {searchQuery && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </form>
      
      {/* Search Suggestions Dropdown */}
      {isFocused && (searchQuery.length >= 3) && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 z-50">
          {error && (
            <div className="p-4 text-center text-red-500 text-sm">
              {error}
            </div>
          )}
          
          {!loading && !error && suggestions.length === 0 && searchQuery.length >= 3 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No locations found for "{searchQuery}"
            </div>
          )}
          
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Locations
              </div>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full flex items-start space-x-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <span className="text-xl mt-0.5">{getResultIcon(suggestion.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 font-medium truncate">
                      {suggestion.city || suggestion.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {suggestion.name}
                    </div>
                  </div>
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                </button>
              ))}
            </div>
          )}
          
          {/* API Key Warning */}
          {searchQuery.length >= 3 && GEOAPIFY_API_KEY === 'YOUR_GEOAPIFY_API_KEY_HERE' && (
            <div className="p-4 bg-yellow-50 border-t border-yellow-200">
              <div className="text-xs text-yellow-800">
                <strong>⚠️ API Key Required:</strong> Please add your Geoapify API key in{' '}
                <code className="bg-yellow-100 px-1 py-0.5 rounded">config/geoapify.config.js</code>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
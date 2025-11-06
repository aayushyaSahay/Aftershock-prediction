import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LeftSidebar from '@/components/UI/LeftSidebar';
import SearchBar from '@/components/UI/SearchBar';
import FilterButtons from '@/components/UI/FilterButtons';
import EarthquakeList from '@/components/Earthquake/EarthquakeList';
import DetailPanel from '@/components/Earthquake/DetailPanel';
import LocationRiskPanel from '@/components/Earthquake/LocationRiskPanel';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { fetchRecentEarthquakes } from '@/utils/api';
import { MapPin, X } from 'lucide-react';

// Dynamically import map component (only on client-side)
const EarthquakeMap = dynamic(
  () => import('@/components/Map/EarthquakeMap'),
  { ssr: false }
);

export default function Home() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [selectedEarthquake, setSelectedEarthquake] = useState(null);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [timeFilter, setTimeFilter] = useState(7);
  const [mapLayer, setMapLayer] = useState('satellite');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [showEarthquakeList, setShowEarthquakeList] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  
  useEffect(() => {
    loadEarthquakes();
  }, [timeFilter]);
  
  const loadEarthquakes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchRecentEarthquakes(timeFilter, 4.0);
      setEarthquakes(data.earthquakes || []);
      
      // If earthquakes exist and no user interaction yet, center on the most recent one
      if (data.earthquakes && data.earthquakes.length > 0 && !userLocation && !searchedLocation) {
        const latest = data.earthquakes[0];
        setMapCenter([latest.latitude, latest.longitude]);
        setMapZoom(5);
      }
    } catch (err) {
      setError('Failed to load earthquakes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEarthquakeClick = (earthquake) => {
    setSelectedEarthquake(earthquake);
    setSearchedLocation(null); // Clear searched location when earthquake is clicked
    setMapCenter([earthquake.latitude, earthquake.longitude]);
    setMapZoom(7);
    setShowEarthquakeList(false);
  };
  
  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude];
          setUserLocation(location);
          setMapCenter(location);
          setMapZoom(10);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };
  
  const handleLocationSearch = (location) => {
    // location object has: { name, latitude, longitude }
    setSearchedLocation(location);
    setSelectedEarthquake(null); // Clear selected earthquake when location is searched
    setMapCenter([location.latitude, location.longitude]);
    setMapZoom(10);
    setShowEarthquakeList(false);
  };
  
  const handleClearSearch = () => {
    setSearchedLocation(null);
  };
  
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-100">
      {/* Left Sidebar */}
      <LeftSidebar />
      
      {/* Main Map Area - Full Screen */}
      <div className="absolute inset-0 pl-16">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner message="Loading map..." />
          </div>
        ) : (
          <EarthquakeMap
            earthquakes={earthquakes}
            selectedEarthquake={selectedEarthquake}
            onEarthquakeClick={handleEarthquakeClick}
            center={mapCenter}
            zoom={mapZoom}
            userLocation={userLocation}
            searchedLocation={searchedLocation}
            mapLayer={mapLayer}
          />
        )}
        
        {/* Floating Search Bar */}
        <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-[600px] z-30">
          <SearchBar
            onLocationSearch={handleLocationSearch}
            onShowList={() => setShowEarthquakeList(!showEarthquakeList)}
            onClearSearch={handleClearSearch}
          />
        </div>
        
        {/* Filter Buttons - Top Right */}
        <div className="absolute top-4 right-4 z-30">
          <FilterButtons
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            mapLayer={mapLayer}
            setMapLayer={setMapLayer}
          />
        </div>
        
        {/* My Location Button - Bottom Right */}
        <button
          onClick={handleLocationClick}
          className="absolute bottom-24 right-4 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center border border-gray-200 hover:border-gray-300 z-30"
          title="Use my location"
        >
          <MapPin className="w-5 h-5 text-gray-600" />
        </button>
        
        {/* Earthquake List Panel - Slides from left */}
        {showEarthquakeList && (
          <>
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/20 z-40"
              onClick={() => setShowEarthquakeList(false)}
            />
            
            {/* Panel */}
            <div className="absolute left-0 top-0 bottom-0 w-full md:w-96 bg-white shadow-2xl z-50 overflow-hidden rounded-r-3xl">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Earthquakes ({earthquakes.length})
                  </h2>
                  <button
                    onClick={() => setShowEarthquakeList(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                {/* List */}
                <div className="flex-1 overflow-y-auto">
                  {error ? (
                    <div className="p-6 text-center">
                      <p className="text-red-500">{error}</p>
                      <button
                        onClick={loadEarthquakes}
                        className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <EarthquakeList
                      earthquakes={earthquakes}
                      selectedEarthquake={selectedEarthquake}
                      onEarthquakeClick={handleEarthquakeClick}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Detail Panel - Slides from right (for earthquake) */}
        {selectedEarthquake && (
          <DetailPanel
            earthquake={selectedEarthquake}
            onClose={() => setSelectedEarthquake(null)}
          />
        )}
        
        {/* Location Risk Panel - Slides from right (for searched location) */}
        {searchedLocation && !selectedEarthquake && (
          <LocationRiskPanel
            location={searchedLocation}
            onClose={handleClearSearch}
            allEarthquakes={earthquakes}
          />
        )}
      </div>
    </div>
  );
}

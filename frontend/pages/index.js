import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/UI/Header';
import EarthquakeList from '@/components/Earthquake/EarthquakeList';
import DetailPanel from '@/components/Earthquake/DetailPanel';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { fetchRecentEarthquakes } from '@/utils/api';
import { AlertCircle } from 'lucide-react';

// Dynamically import map component (only on client-side)
const EarthquakeMap = dynamic(
  () => import('@/components/Map/EarthquakeMap'),
  { ssr: false }
);

export default function Home() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [selectedEarthquake, setSelectedEarthquake] = useState(null);
  const [timeFilter, setTimeFilter] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [showSidebar, setShowSidebar] = useState(true);
  
  useEffect(() => {
    loadEarthquakes();
  }, [timeFilter]);
  
  const loadEarthquakes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchRecentEarthquakes(timeFilter, 4.0);
      setEarthquakes(data.earthquakes || []);
      
      // If earthquakes exist, center on the most recent one
      if (data.earthquakes && data.earthquakes.length > 0) {
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
    setMapCenter([earthquake.latitude, earthquake.longitude]);
    setMapZoom(7);
  };
  
  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
          setMapZoom(8);
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
  
  return (
    <div className="min-h-screen bg-bg-dark text-text-primary">
      <Header
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        onLocationClick={handleLocationClick}
      />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar - Earthquake List */}
        <div
          className={`${
            showSidebar ? 'w-full md:w-80 lg:w-96' : 'w-0'
          } bg-bg-dark border-r border-white/10 transition-all duration-300 overflow-hidden md:block`}
        >
          {loading ? (
            <LoadingSpinner message="Loading earthquakes..." />
          ) : error ? (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
                <p className="text-text-secondary">{error}</p>
                <button
                  onClick={loadEarthquakes}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <EarthquakeList
              earthquakes={earthquakes}
              selectedEarthquake={selectedEarthquake}
              onEarthquakeClick={handleEarthquakeClick}
            />
          )}
        </div>
        
        {/* Main Map Area */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="h-full flex items-center justify-center bg-map-bg">
              <LoadingSpinner message="Loading map..." />
            </div>
          ) : (
            <EarthquakeMap
              earthquakes={earthquakes}
              selectedEarthquake={selectedEarthquake}
              onEarthquakeClick={handleEarthquakeClick}
              center={mapCenter}
              zoom={mapZoom}
            />
          )}
          
          {/* Toggle Sidebar Button (Mobile) */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden absolute top-4 left-4 z-10 px-4 py-2 bg-bg-card border border-white/10 rounded-lg shadow-lg"
          >
            {showSidebar ? 'Hide' : 'Show'} List
          </button>
        </div>
        
        {/* Detail Panel */}
        {selectedEarthquake && (
          <DetailPanel
            earthquake={selectedEarthquake}
            onClose={() => setSelectedEarthquake(null)}
          />
        )}
      </div>
    </div>
  );
}
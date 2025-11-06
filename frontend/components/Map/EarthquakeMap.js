import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { formatMagnitude, formatTimeAgo, getMagnitudeColor, truncatePlace } from '@/utils/formatters';
import { ChevronDown, ChevronUp } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Component to update map view
function ChangeView({ center, zoom, hasRightPanel = true }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    const targetZoom = zoom ?? map.getZoom();
    const mapSize = map.getSize();
    const offsetX = hasRightPanel ? mapSize.x * -0.17 : 0;
    const offsetY = 0;

    const currentPoint = map.project(center, targetZoom);
    const adjustedPoint = L.point(currentPoint.x - offsetX, currentPoint.y - offsetY);
    const adjustedLatLng = map.unproject(adjustedPoint, targetZoom);

    map.flyTo(adjustedLatLng, targetZoom, {
      animate: true,
      duration: 1.5,
      easeLinearity: 0.1,
    });
  }, [center, zoom, hasRightPanel, map]);

  return null;
}

// Calculate hazard zone radii based on magnitude
function calculateHazardZones(magnitude) {
  const baseRadius = Math.pow(10, magnitude - 2) * 1000;
  
  return {
    critical: baseRadius * 0.3,
    high: baseRadius * 0.6,
    moderate: baseRadius * 1.0,
  };
}

// Get opacity and color based on zone type and magnitude
function getZoneStyle(zoneType, magnitude) {
  const color = getMagnitudeColor(magnitude);
  
  const styles = {
    critical: {
      fillColor: color,
      fillOpacity: 0.35,
      color: color,
      weight: 2,
      opacity: 0.8,
    },
    high: {
      fillColor: color,
      fillOpacity: 0.20,
      color: color,
      weight: 1.5,
      opacity: 0.6,
    },
    moderate: {
      fillColor: color,
      fillOpacity: 0.10,
      color: color,
      weight: 1,
      opacity: 0.4,
    },
  };
  
  return styles[zoneType];
}

// Hazard zones component for an earthquake
function HazardZones({ earthquake, onClick }) {
  const zones = calculateHazardZones(earthquake.magnitude);
  const center = [earthquake.latitude, earthquake.longitude];
  
  return (
    <>
      {/* Moderate zone (outermost) */}
      <Circle
        center={center}
        radius={zones.moderate}
        pathOptions={getZoneStyle('moderate', earthquake.magnitude)}
        eventHandlers={{ click: () => onClick(earthquake) }}
      >
        <Popup>
          <div className="text-sm">
            <div className="font-bold text-yellow-600">Moderate Risk Zone</div>
            <div className="text-xs mt-1">
              Radius: ~{Math.round(zones.moderate / 1000)} km
            </div>
            <div className="text-xs text-gray-600">
              Area with potential for noticeable aftershocks
            </div>
          </div>
        </Popup>
      </Circle>
      
      {/* High risk zone (middle) */}
      <Circle
        center={center}
        radius={zones.high}
        pathOptions={getZoneStyle('high', earthquake.magnitude)}
        eventHandlers={{ click: () => onClick(earthquake) }}
      >
        <Popup>
          <div className="text-sm">
            <div className="font-bold text-orange-600">High Risk Zone</div>
            <div className="text-xs mt-1">
              Radius: ~{Math.round(zones.high / 1000)} km
            </div>
            <div className="text-xs text-gray-600">
              Area with high probability of strong aftershocks
            </div>
          </div>
        </Popup>
      </Circle>
      
      {/* Critical zone (innermost) */}
      <Circle
        center={center}
        radius={zones.critical}
        pathOptions={getZoneStyle('critical', earthquake.magnitude)}
        eventHandlers={{ click: () => onClick(earthquake) }}
      >
        <Popup>
          <div className="text-sm">
            <div className="font-bold text-red-600">Critical Risk Zone</div>
            <div className="text-xs mt-1">
              Radius: ~{Math.round(zones.critical / 1000)} km
            </div>
            <div className="text-xs text-gray-600">
              Epicenter area - highest aftershock risk
            </div>
          </div>
        </Popup>
      </Circle>
    </>
  );
}

// User location marker component
function UserLocationMarker({ position }) {
  if (!position) return null;

  // Create a pulsing blue dot icon for user location
  const icon = L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="position: relative; width: 40px; height: 40px;">
        <!-- Outer pulsing circle -->
        <div class="user-location-pulse" style="
          position: absolute;
          left: 50%;
          top: 50%;
          width: 40px;
          height: 40px;
          margin-left: -20px;
          margin-top: -20px;
          border-radius: 50%;
          background-color: rgba(59, 130, 246, 0.3);
          border: 2px solid rgba(59, 130, 246, 0.5);
        "></div>
        
        <!-- Inner blue dot -->
        <div style="
          position: absolute;
          left: 50%;
          top: 50%;
          width: 16px;
          height: 16px;
          margin-left: -8px;
          margin-top: -8px;
          background-color: #3b82f6;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div className="text-sm">
          <div className="font-bold text-blue-600">Your Location</div>
          <div className="text-xs text-gray-600 mt-1">
            {position[0].toFixed(4)}°, {position[1].toFixed(4)}°
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Epicenter marker component
function EpicenterMarker({ earthquake, onClick, isSelected }) {
  const mag = earthquake.magnitude;
  const color = getMagnitudeColor(mag);
  const radius = Math.max(8, Math.min(24, mag * 4));
  const containerSize = Math.max(48, radius * 4);

  const borderColor = isSelected ? '#1f2937' : 'white';
  const borderWidth = isSelected ? 4 : 3;

  const icon = L.divIcon({
    className: 'custom-epicenter-marker',
    html: `
      <div style="width: ${containerSize}px; height: ${containerSize}px; position: relative; display: block;">
        <div class="epicenter-ring" style="
          position: absolute;
          left: 50%;
          top: 50%;
          width: ${radius}px;
          height: ${radius}px;
          margin-left: -${radius/2}px;
          margin-top: -${radius/2}px;
          border-radius: 50%;
          border: 2px solid ${color};
          box-sizing: border-box;
          opacity: 0.8;
        "></div>

        <div style="
          position: absolute;
          left: 50%;
          top: 50%;
          width: ${radius}px;
          height: ${radius}px;
          margin-left: -${radius/2}px;
          margin-top: -${radius/2}px;
          background-color: ${color};
          border-radius: 50%;
          border: ${borderWidth}px solid ${borderColor};
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          transition: border-color 0.2s ease, transform 0.2s ease;
          transform: scale(${isSelected ? 1.1 : 1});
        "></div>
      </div>
    `,
    iconSize: [containerSize, containerSize],
    iconAnchor: [containerSize / 2, containerSize / 2],
  });

  return (
    <Marker
      position={[earthquake.latitude, earthquake.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onClick(earthquake),
      }}
    >
      <Popup>
        <div className="text-sm space-y-1">
          <div className="font-bold text-lg" style={{ color }}>
            {formatMagnitude(mag)}
          </div>
          <div className="font-medium">
            {truncatePlace(earthquake.place, 30)}
          </div>
          <div className="text-xs text-gray-600">
            {formatTimeAgo(earthquake.time)}
          </div>
          <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
            Click for detailed forecast
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Map layer configurations
const mapLayers = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com">Esri</a>',
    hasLabels: true,
    labelsUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
  },
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    hasLabels: false,
  },
  terrain: {
    url: "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://stamen.com/">Stamen Design</a>',
    hasLabels: false,
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    hasLabels: false,
  },
};

export default function EarthquakeMap({ 
  earthquakes, 
  selectedEarthquake, 
  onEarthquakeClick, 
  center, 
  zoom,
  userLocation,
  mapLayer = 'satellite'
}) {
  const [mapCenter, setMapCenter] = useState(center || [20, 0]);
  const [mapZoom, setMapZoom] = useState(zoom || 2);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  
  useEffect(() => {
    if (center) setMapCenter(center);
    if (zoom) setMapZoom(zoom);
  }, [center, zoom]);
  
  const currentLayer = mapLayers[mapLayer] || mapLayers.satellite;
  
  // Set max bounds to prevent world from repeating
  const maxBounds = [
    [-90, -180],  // Southwest coordinates
    [90, 180]     // Northeast coordinates
  ];
  
  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-200">
      <style jsx global>{`
        @keyframes epicenter-ring {
          0% {
            transform: translate(0%, 0%) scale(1);
            opacity: 0.8;
          }
          70% {
            transform: translate(0%, 0%) scale(2.6);
            opacity: 0;
          }
          100% {
            transform: translate(0%, 0%) scale(2.8);
            opacity: 0;
          }
        }

        .epicenter-ring {
          pointer-events: none;
          animation: epicenter-ring 2000ms ease-out infinite;
        }
        
        .custom-epicenter-marker {
          background: transparent !important;
          border: none !important;
        }
        
        /* User location pulsing animation */
        @keyframes user-location-pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.3;
          }
          100% {
            transform: scale(1);
            opacity: 0.6;
          }
        }
        
        .user-location-pulse {
          animation: user-location-pulse 2s ease-out infinite;
        }
        
        .user-location-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        minZoom={2}
        maxZoom={18}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        className="z-0"
      >
        <ChangeView center={mapCenter} zoom={mapZoom} hasRightPanel={!!selectedEarthquake} />
        
        {/* Base layer */}
        <TileLayer
          attribution={currentLayer.attribution}
          url={currentLayer.url}
          noWrap={false}
        />
        
        {/* Labels overlay (for satellite view) */}
        {currentLayer.hasLabels && (
          <TileLayer
            attribution=''
            url={currentLayer.labelsUrl}
            noWrap={false}
          />
        )}
        
        {/* Render hazard zones only for the selected earthquake */}
        {selectedEarthquake ? (
          <HazardZones
            key={`zones-${selectedEarthquake.id}`}
            earthquake={selectedEarthquake}
            onClick={onEarthquakeClick}
          />
        ) : null}
        
        {/* Render user location marker */}
        {userLocation && <UserLocationMarker position={userLocation} />}
        
        {/* Render epicenter markers on top */}
        {earthquakes.map((eq) => (
          <EpicenterMarker
            key={`marker-${eq.id}`}
            earthquake={eq}
            onClick={onEarthquakeClick}
            isSelected={selectedEarthquake && selectedEarthquake.id === eq.id}
          />
        ))}
      </MapContainer>
      
      {/* Collapsible Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-lg border border-gray-200 rounded-2xl overflow-hidden text-xs z-10 max-w-xs shadow-lg">
        {/* Legend Header - Always Visible */}
        <button
          onClick={() => setLegendCollapsed(!legendCollapsed)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="font-semibold text-gray-900 text-sm">Hazard Zone Legend</span>
          {legendCollapsed ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </button>
        
        {/* Legend Content - Collapsible */}
        {!legendCollapsed && (
          <div className="px-4 pb-4 space-y-3">
            {/* Magnitude Scale */}
            <div>
              <div className="text-gray-500 text-xs mb-2">Magnitude Scale</div>
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#dc2626' }}></div>
                  <span className="text-gray-600 text-xs">M ≥ 7.0 - Major</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
                  <span className="text-gray-600 text-xs">M 6.0-6.9 - Strong</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fbbf24' }}></div>
                  <span className="text-gray-600 text-xs">M 5.0-5.9 - Moderate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
                  <span className="text-gray-600 text-xs">M 4.0-4.9 - Light</span>
                </div>
              </div>
            </div>
            
            {/* Risk Zones */}
            <div>
              <div className="text-gray-500 text-xs mb-2">Risk Zones</div>
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-red-500/40"></div>
                  <span className="text-gray-600 text-xs">Critical (Epicenter)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full border border-orange-500 bg-orange-500/20"></div>
                  <span className="text-gray-600 text-xs">High Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full border border-yellow-500 bg-yellow-500/10"></div>
                  <span className="text-gray-600 text-xs">Moderate Risk</span>
                </div>
              </div>
            </div>
            
            {/* User Location Indicator */}
            {userLocation && (
              <div>
                <div className="text-gray-500 text-xs mb-2">Location</div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                  <span className="text-gray-600 text-xs">Your Location</span>
                </div>
              </div>
            )}
            
            <div className="pt-3 border-t border-gray-200 text-gray-500 text-xs">
              Zone sizes based on earthquake magnitude and historical patterns
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
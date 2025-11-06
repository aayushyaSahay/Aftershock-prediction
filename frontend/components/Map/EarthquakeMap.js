import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { formatMagnitude, formatTimeAgo, getMagnitudeColor, truncatePlace } from '@/utils/formatters';
import 'leaflet/dist/leaflet.css';

// Component to update map view
function ChangeView({ center, zoom, hasRightPanel = true }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    const targetZoom = zoom ?? map.getZoom();

    // Get map size in pixels
    const mapSize = map.getSize();

    // Calculate offset so that the marker ends up centered in visible map portion
    // For example, if your detail panel covers ~25% of the width, shift the target left by that much
    const offsetX = hasRightPanel ? mapSize.x * -0.17 : 0; // tweak 0.25 → 0.3 if needed
    const offsetY = 0;

    // Compute the *adjusted center* directly in map coordinates
    const currentPoint = map.project(center, targetZoom);
    const adjustedPoint = L.point(currentPoint.x - offsetX, currentPoint.y - offsetY);
    const adjustedLatLng = map.unproject(adjustedPoint, targetZoom);

    // Smoothly fly to that adjusted point
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
  // Empirical formula: radius increases exponentially with magnitude
  // These zones represent areas likely affected by aftershocks
  const baseRadius = Math.pow(10, magnitude - 2) * 1000; // in meters
  
  return {
    critical: baseRadius * 0.3,  // Inner zone - highest risk
    high: baseRadius * 0.6,      // Middle zone - high risk
    moderate: baseRadius * 1.0,  // Outer zone - moderate risk
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

// Epicenter marker component
function EpicenterMarker({ earthquake, onClick, isSelected }) {
  const mag = earthquake.magnitude;
  const color = getMagnitudeColor(mag);
  const radius = Math.max(8, Math.min(24, mag * 4));
  const containerSize = Math.max(48, radius * 4);

  // Choose border color based on selection
  const borderColor = isSelected ? 'black' : 'white';
  const borderWidth = isSelected ? 4 : 3;

  // Create custom epicenter icon
  const icon = L.divIcon({
    className: 'custom-epicenter-marker',
    html: `
      <div style="width: ${containerSize}px; height: ${containerSize}px; position: relative; display: block;">
        <!-- expanding ring -->
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

        <!-- fixed center -->
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
          box-shadow: 0 0 8px rgba(0,0,0,0.45);
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

export default function EarthquakeMap({ earthquakes, selectedEarthquake, onEarthquakeClick, center, zoom }) {
  const [mapCenter, setMapCenter] = useState(center || [20, 0]);
  const [mapZoom, setMapZoom] = useState(zoom || 2);
  
  useEffect(() => {
    if (center) setMapCenter(center);
    if (zoom) setMapZoom(zoom);
  }, [center, zoom]);
  
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-200">
      <style jsx global>{`
        /* expanding ring animation for epicenter */
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
      `}</style>
      
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        className="z-0"
      >
        <ChangeView center={mapCenter} zoom={mapZoom} hasRightPanel={!!selectedEarthquake} />
        
        {/* Satellite imagery base layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        
        {/* Labels overlay */}
        <TileLayer
          attribution=''
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />
        
        {/* Render hazard zones only for the selected earthquake */}
        {selectedEarthquake ? (
          <HazardZones
            key={`zones-${selectedEarthquake.id}`}
            earthquake={selectedEarthquake}
            onClick={onEarthquakeClick}
          />
        ) : null}
        
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
      
      {/* Enhanced Legend */}
      <div className="absolute bottom-4 right-4 bg-bg-card/95 backdrop-blur-lg border border-white/10 rounded-lg p-4 text-xs z-10 max-w-xs">
        <div className="font-semibold mb-3 text-white text-sm">Hazard Zone Legend</div>
        
        {/* Magnitude Scale */}
        <div className="mb-3">
          <div className="text-text-secondary text-xs mb-2">Magnitude Scale</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#dc2626' }}></div>
              <span className="text-text-secondary">M ≥ 7.0 - Major</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
              <span className="text-text-secondary">M 6.0-6.9 - Strong</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#fbbf24' }}></div>
              <span className="text-text-secondary">M 5.0-5.9 - Moderate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
              <span className="text-text-secondary">M 4.0-4.9 - Light</span>
            </div>
          </div>
        </div>
        
        {/* Risk Zones */}
        <div>
          <div className="text-text-secondary text-xs mb-2">Risk Zones</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-red-500/40"></div>
              <span className="text-text-secondary">Critical (Epicenter)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full border border-orange-500 bg-orange-500/20"></div>
              <span className="text-text-secondary">High Risk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full border border-yellow-500 bg-yellow-500/10"></div>
              <span className="text-text-secondary">Moderate Risk</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/10 text-text-secondary text-xs">
          Zone sizes based on earthquake magnitude and historical aftershock patterns
        </div>
      </div>
    </div>
  );
}

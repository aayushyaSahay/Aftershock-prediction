import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { formatMagnitude, formatTimeAgo, getMagnitudeColor, truncatePlace } from '@/utils/formatters';
import 'leaflet/dist/leaflet.css';

// Component to update map view
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Pulsing marker component

function PulsingMarker({ earthquake, onClick }) {
  const mag = earthquake.magnitude;
  const color = getMagnitudeColor(mag);
  const radius = Math.max(10, Math.min(40, mag * 6));
  
  // Create custom pulsing icon
  const icon = L.divIcon({
    className: 'custom-earthquake-marker',
    html: `
      <div class="pulse" style="
        width: ${radius}px;
        height: ${radius}px;
        background-color: ${color};
        border: 2px solid ${color};
        border-radius: 50%;
        opacity: 0.8;
      "></div>
    `,
    iconSize: [radius, radius],
    iconAnchor: [radius / 2, radius / 2],
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
          <div className="text-text-secondary">
            {truncatePlace(earthquake.place, 30)}
          </div>
          <div className="text-xs text-text-secondary">
            {formatTimeAgo(earthquake.time)}
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
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        className="z-0"
      >
        <ChangeView center={mapCenter} zoom={mapZoom} />
        

        <TileLayer
          attribution='&copy; <a href="https://www.esri.com">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        {/* Labels overlay */}
        <TileLayer
          attribution=''
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />

        {/* Satellite tile layer
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        /> */}

        {/* Dark themed tile layer
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        /> */}
        
        {/* Earthquake markers */}
        {earthquakes.map((eq) => (
          <PulsingMarker
            key={eq.id}
            earthquake={eq}
            onClick={onEarthquakeClick}
          />
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-bg-card/90 backdrop-blur-lg border border-white/10 rounded-lg p-3 text-xs z-10">
        <div className="font-semibold mb-2 text-white">Magnitude Scale</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#dc2626' }}></div>
            <span className="text-text-secondary">M ≥ 7.0</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="text-text-secondary">M 6.0-6.9</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#fbbf24' }}></div>
            <span className="text-text-secondary">M 5.0-5.9</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
            <span className="text-text-secondary">M 4.0-4.9</span>
          </div>
        </div>
      </div>
    </div>
  );
}
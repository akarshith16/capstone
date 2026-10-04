import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAgentPipeline } from '../context/AgentPipelineContext';
import type { Incident } from '../data/mockData';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (priority: Incident['priority'], status: Incident['status']) => {
  let color = '#3B82F6';
  if (status === 'Resolved') color = '#6B7280'; // gray when resolved
  else if (priority === 'Critical') color = '#EF4444';
  else if (priority === 'High') color = '#F59E0B';
  else if (priority === 'Moderate') color = '#10B981';
  
  const isPending = status !== 'Routed' && status !== 'Resolved';
  const pulseAnim = isPending ? 'animate-ping' : '';

  const html = `
    <div class="relative flex items-center justify-center w-6 h-6">
      <div class="absolute w-full h-full rounded-full opacity-50 ${pulseAnim}" style="background-color: ${color}"></div>
      <div class="relative w-3 h-3 rounded-full border border-white" style="background-color: ${color}"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'bg-transparent',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const MapCenterUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { animate: true, duration: 1 });
  }, [center, map]);
  return null;
};

const MapView: React.FC = () => {
  const { filteredIncidents, activeIncident, setActiveIncident } = useAgentPipeline();
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    // We simulate using the VITE_MADRID_GEO_API_KEY from .env here by fetching the dataset
    
    // Fetch Madrid Districts GeoJSON
    fetch('https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/madrid-districts.geojson', {
      headers: {
        'X-Simulated-Key': import.meta.env.VITE_MADRID_GEO_API_KEY || 'free_tier_fallback'
      }
    })
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Error loading geojson", err));
  }, []);

  const center: [number, number] = activeIncident?.coordinates || [40.4168, -3.7038];

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={[40.4168, -3.7038]}
        zoom={12}
        style={{ height: '100%', width: '100%', background: '#0B0F19' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {geoData && (
          <GeoJSON 
            data={geoData} 
            style={() => ({
              color: '#3B82F6',
              weight: 1,
              opacity: 0.3,
              fillOpacity: 0.05,
              fillColor: '#3B82F6'
            })}
          />
        )}

        {activeIncident && <MapCenterUpdater center={center} />}

        {filteredIncidents.map((incident) => (
          <Marker
            key={incident.id}
            position={incident.coordinates}
            icon={createCustomIcon(incident.priority, incident.status)}
            eventHandlers={{
              click: () => setActiveIncident(incident),
            }}
          >
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAgentPipeline } from '../context/AgentPipelineContext';
import type { Incident } from '../data/mockData';
import { REAL_SIVCA_STATIONS, REAL_MOBILE_UMMA_UNITS } from '../data/sivca_dataset';
import { Layers } from 'lucide-react';

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

const createSivcaStationIcon = () => {
  const html = `
    <div class="relative flex items-center justify-center w-6 h-6">
      <div class="absolute w-full h-full rounded-full bg-cyan-500/25 animate-pulse border border-cyan-400/50"></div>
      <div class="relative w-3 h-3 rounded-full bg-cyan-400 border border-black shadow-[0_0_8px_rgba(6,182,212,0.9)]"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'bg-transparent',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createMobileUmmaIcon = () => {
  const html = `
    <div class="relative flex items-center justify-center w-7 h-7">
      <div class="absolute w-full h-full rounded-full bg-purple-500/30 animate-pulse border border-purple-400/60"></div>
      <div class="relative w-4 h-4 rounded-full bg-purple-600 border border-white shadow-[0_0_10px_rgba(168,85,247,0.9)] flex items-center justify-center">
        <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'bg-transparent',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
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
  const [showFixedStations, setShowFixedStations] = useState(true);
  const [showMobileUnits, setShowMobileUnits] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);

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

        {/* 31 Real Madrid SIVCA Fixed Stations (Cyan) */}
        {showFixedStations &&
          REAL_SIVCA_STATIONS.map((station) => (
            <Marker
              key={station.id}
              position={station.coords}
              icon={createSivcaStationIcon()}
            >
              <Popup className="custom-sivca-popup">
                <div className="text-black p-1 text-xs space-y-1">
                  <p className="font-bold text-cyan-800 flex items-center justify-between">
                    <span>SIVCA Station {station.id}</span>
                    <span className="text-[9px] bg-cyan-100 text-cyan-800 px-1 rounded font-mono">Fixed</span>
                  </p>
                  <p className="font-semibold text-gray-900">{station.name} ({station.district})</p>
                  <p className="text-[11px] text-gray-700">
                    Night Average (Ln): <strong>{station.historicalNightAvgDb} dBA</strong>
                  </p>
                  <p className="text-[10px] text-gray-500">{station.recordedPeriod}</p>
                  {station.zpaeArea && (
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Protected ZPAE Area
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 17 Mobile SIVCA Acoustic Fleet Units (UMMA / Policía Municipal) (Purple) */}
        {showMobileUnits &&
          REAL_MOBILE_UMMA_UNITS.map((unit) => (
            <Marker
              key={unit.id}
              position={unit.coords}
              icon={createMobileUmmaIcon()}
            >
              <Popup className="custom-sivca-popup">
                <div className="text-black p-1 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-purple-800 flex items-center">
                      <span>{unit.name}</span>
                    </p>
                    <span className="text-[9px] bg-purple-100 text-purple-800 px-1 rounded font-mono font-bold">
                      {unit.status}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">{unit.sectorName}</p>
                  <p className="text-[11px] text-gray-700">
                    Equipment: <strong>{unit.equipment}</strong>
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Agency: {unit.assignedAgency}
                  </p>
                  {unit.zpaeTarget && (
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                      Targeted ZPAE Patrol Corridor
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Render Active Citizen Incidents */}
        {showIncidents &&
          filteredIncidents.map((incident) => (
            <Marker
              key={incident.id}
              position={incident.coordinates}
              icon={createCustomIcon(incident.priority, incident.status)}
              eventHandlers={{
                click: () => setActiveIncident(incident),
              }}
            />
          ))}
      </MapContainer>

      {/* Floating Map Layers Control & Telemetry Legend */}
      <div className="absolute top-24 right-6 z-20 bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-2xl space-y-2.5 text-xs text-white max-w-xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-primary" />
            Madrid Acoustic Map Layers
          </span>
          <span className="text-[9px] font-mono text-gray-400">Live GeoJSON</span>
        </div>

        <div className="space-y-2 text-[11px]">
          <label className="flex items-center justify-between cursor-pointer hover:text-white text-gray-300">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse"></span>
              <span>31 Fixed SIVCA Stations</span>
            </div>
            <input
              type="checkbox"
              checked={showFixedStations}
              onChange={(e) => setShowFixedStations(e.target.checked)}
              className="rounded accent-cyan-400 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-white text-gray-300">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.9)] animate-pulse"></span>
              <span>17 Mobile UMMA Fleet Units</span>
            </div>
            <input
              type="checkbox"
              checked={showMobileUnits}
              onChange={(e) => setShowMobileUnits(e.target.checked)}
              className="rounded accent-purple-400 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-white text-gray-300">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]"></span>
              <span>Citizen Reports ({filteredIncidents.length})</span>
            </div>
            <input
              type="checkbox"
              checked={showIncidents}
              onChange={(e) => setShowIncidents(e.target.checked)}
              className="rounded accent-blue-400 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default MapView;

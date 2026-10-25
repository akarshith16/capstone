import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LocateFixed, Loader2, AlertTriangle } from 'lucide-react';
import { isInMadrid } from './constants';

const pinIcon = L.divIcon({
  html: `
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 43C18 43 33 28.5 33 17.5C33 9.2 26.3 2.5 18 2.5C9.7 2.5 3 9.2 3 17.5C3 28.5 18 43 18 43Z" fill="#3B82F6" stroke="white" stroke-width="2"/>
      <circle cx="18" cy="17.5" r="5.5" fill="white"/>
    </svg>
  `,
  className: 'bg-transparent drop-shadow-lg',
  iconSize: [36, 44],
  iconAnchor: [18, 43],
});

const MapClickHandler = ({ onPick }: { onPick: (pos: [number, number]) => void }) => {
  useMapEvents({
    click: (e) => onPick([e.latlng.lat, e.latlng.lng]),
  });
  return null;
};

const FlyTo = ({ target }: { target: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 17, { duration: 0.8 });
  }, [target, map]);
  return null;
};

interface LocationPickerProps {
  position: [number, number];
  onChange: (position: [number, number]) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ position, onChange }) => {
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const locateMe = () => {
    if (!('geolocation' in navigator)) {
      setLocateError("Your browser can't share your location. Drag the pin instead.");
      return;
    }
    setIsLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setIsLocating(false);
        const pos: [number, number] = [coords.latitude, coords.longitude];
        if (!isInMadrid(pos)) {
          setLocateError('You seem to be outside Madrid. Drag the pin to where the noise is.');
          return;
        }
        onChange(pos);
        setFlyTarget(pos);
      },
      () => {
        setIsLocating(false);
        setLocateError("We couldn't get your location. Drag the pin to where the noise is.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={locateMe}
        disabled={isLocating}
        className="w-full flex items-center justify-center gap-2 min-h-12 rounded-2xl bg-primary/15 border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/25 disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
        {isLocating ? 'Finding you…' : 'Use my current location'}
      </button>

      <div className="relative h-72 rounded-2xl overflow-hidden border border-white/10">
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: '100%', width: '100%', background: '#0B0F19' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler onPick={onChange} />
          <FlyTo target={flyTarget} />
          <Marker
            position={position}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = (e.target as L.Marker).getLatLng();
                onChange([lat, lng]);
              },
            }}
          />
        </MapContainer>
        <p className="absolute bottom-2 right-2 z-[400] text-[10px] text-gray-400 bg-black/60 px-1.5 py-0.5 rounded">
          © OpenStreetMap
        </p>
      </div>

      {locateError && (
        <p role="alert" className="flex items-start gap-2 text-sm text-accent">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          {locateError}
        </p>
      )}
    </div>
  );
};

export default LocationPicker;

'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Importación dinámica para evitar problemas de SSR con Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
  id: string;
}

interface MapComponentProps {
  location: LocationData;
  className?: string;
}

export default function MapComponent({ location, className = '' }: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Configurar íconos de Leaflet
    if (typeof window !== 'undefined') {
      import('../utils/leaflet-config');
    }
  }, []);

  if (!isMounted) {
    return (
      <div className={`bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        key={`${location.latitude}-${location.longitude}`} // Force re-render when location changes
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[location.latitude, location.longitude]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Ubicación Actual</p>
              <p>Lat: {location.latitude.toFixed(6)}</p>
              <p>Lng: {location.longitude.toFixed(6)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Actualizado: {new Date(location.timestamp).toLocaleString()}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
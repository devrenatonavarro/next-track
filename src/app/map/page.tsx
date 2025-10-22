'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import MapComponent from '../components/MapComponent';
import 'leaflet/dist/leaflet.css';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
  id: string;
}

// Función para formatear fecha de manera consistente
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/Mexico_City'
  });
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/Mexico_City'
  });
};

export default function MapPage() {
  const { socket, isConnected, error, emit, on } = useSocket();
  const [location, setLocation] = useState<LocationData>({
    latitude: 19.4326, // Ciudad de México por defecto
    longitude: -99.1332,
    timestamp: '', // Inicializar vacío para evitar problemas de hidratación
    id: 'default'
  });
  const [messages, setMessages] = useState<{ text: string; timestamp: string }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const addMessage = (text: string) => {
    setMessages(prev => [...prev, { text, timestamp: new Date().toISOString() }]);
  };

  // Efecto para inicializar el estado del cliente
  useEffect(() => {
    setIsClient(true);
    // Solo inicializar el timestamp en el cliente
    setLocation(prev => ({
      ...prev,
      timestamp: prev.timestamp || new Date().toISOString()
    }));
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Escuchar actualizaciones de ubicación
    const unsubscribeLocationUpdate = on('locationUpdate', (data: LocationData) => {
      console.log('📍 Nueva ubicación recibida:', data);
      setLocation(data);
      addMessage(`Ubicación actualizada: ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`);
    });

    // Solicitar ubicación actual al conectarse
    emit('getCurrentLocation');

    return () => {
      unsubscribeLocationUpdate?.();
    };
  }, [socket, on, emit]);

  const sendMessage = () => {
    if (inputMessage.trim()) {
      emit('message', inputMessage);
      setInputMessage('');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
            id: 'browser-geolocation'
          };
          
          // Enviar via WebSocket
          emit('updateLocation', newLocation);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          addMessage(`Error obteniendo ubicación: ${error.message}`);
        }
      );
    } else {
      addMessage('Geolocalización no está disponible en este navegador');
    }
  };

  const updateLocationManually = async () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      addMessage('Por favor ingresa valores válidos para latitud y longitud');
      return;
    }

    setIsUpdating(true);
    
    try {
      // Enviar via API HTTP
      const response = await fetch('/api/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          id: 'manual-input'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        addMessage(`Ubicación actualizada manualmente: ${lat}, ${lng}`);
        setManualLat('');
        setManualLng('');
      } else {
        addMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error actualizando ubicación:', error);
      addMessage(`Error de red: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const testApiEndpoint = async () => {
    try {
      const response = await fetch('/api/location');
      const result = await response.json();
      
      if (result.success) {
        setLocation(result.location);
        addMessage(`Ubicación obtenida de API: ${result.location.latitude}, ${result.location.longitude}`);
      }
    } catch (error) {
      console.error('Error consultando API:', error);
      addMessage(`Error consultando API: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Mapa en Tiempo Real - Socket.IO + Leaflet</h1>
      
      {/* Estado de conexión */}
      <div className="mb-6 p-4 rounded-lg border">
        <h2 className="text-xl font-semibold mb-2">Estado de Conexión</h2>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Error: {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mapa */}
        <div className="lg:col-span-1">
          <div className="p-4 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Mapa Interactivo</h2>
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-800">
                <strong>Ubicación Actual:</strong><br/>
                Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}<br/>
                {isClient && location.timestamp && (
                  <span className="text-xs">Actualizada: {formatDate(location.timestamp)}</span>
                )}
              </p>
            </div>
            <MapComponent 
              location={location} 
              className="h-96 w-full border rounded-lg"
            />
          </div>
        </div>

        {/* Controles */}
        <div className="lg:col-span-1 space-y-6">
          {/* Controles de ubicación */}
          <div className="p-4 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Controles de Ubicación</h2>
            <div className="space-y-3">
              <button
                onClick={getCurrentLocation}
                disabled={!isConnected}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                📍 Usar Mi Ubicación GPS
              </button>
              
              <button
                onClick={testApiEndpoint}
                disabled={!isConnected}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                🔄 Obtener Ubicación del Servidor
              </button>
            </div>
            
            {/* Actualización manual */}
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">Actualizar Ubicación Manualmente</h3>
              <div className="space-y-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitud (ej: 19.4326)"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="w-full px-3 py-1 border rounded text-sm"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitud (ej: -99.1332)"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  className="w-full px-3 py-1 border rounded text-sm"
                />
                <button
                  onClick={updateLocationManually}
                  disabled={isUpdating || !manualLat || !manualLng}
                  className="w-full px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  {isUpdating ? '⏳ Actualizando...' : '📝 Actualizar Manualmente'}
                </button>
              </div>
            </div>
          </div>

          {/* Chat/Log de eventos */}
          <div className="p-4 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Log de Eventos</h2>
            
            {/* Lista de mensajes */}
            <div className="h-48 overflow-y-auto border rounded p-3 mb-4 bg-gray-50">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center text-sm">No hay eventos aún...</p>
              ) : (
                messages.slice(-10).map((message, index) => (
                  <div key={index} className="mb-2 p-2 bg-white rounded shadow-sm text-sm">
                    {isClient && (
                      <span className="text-xs text-gray-500">
                        {formatTime(new Date(message.timestamp))}
                      </span>
                    )}
                    <br />
                    {message.text}
                  </div>
                ))
              )}
            </div>
            
            {/* Input para enviar mensajes */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe un mensaje..."
                disabled={!isConnected}
                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={!isConnected || !inputMessage.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Información de uso */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Cómo usar:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>GPS:</strong> Usa tu ubicación actual del navegador</li>
          <li>• <strong>Manual:</strong> Ingresa coordenadas específicas</li>
          <li>• <strong>API:</strong> POST a <code>/api/location</code> con lat/lng para actualizar desde externa</li>
          <li>• <strong>WebSocket:</strong> Actualizaciones en tiempo real automáticas</li>
        </ul>
      </div>
    </div>
  );
}
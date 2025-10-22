// Tipos para los eventos de Socket.IO

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
  userId?: string;
}

export interface MapData {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  markers?: MarkerData[];
}

export interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  type: 'user' | 'poi' | 'custom';
}

export interface ChatMessage {
  id: string;
  message: string;
  userId: string;
  timestamp: string;
  username?: string;
}

// Eventos que el cliente puede emitir
export interface ClientToServerEvents {
  message: (data: string) => void;
  getMapData: () => void;
  locationUpdate: (data: LocationData) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

// Eventos que el servidor puede emitir
export interface ServerToClientEvents {
  message: (data: string) => void;
  mapData: (data: MapData) => void;
  locationUpdate: (data: LocationData) => void;
  userJoined: (data: { userId: string; username: string }) => void;
  userLeft: (data: { userId: string; username: string }) => void;
  chatMessage: (data: ChatMessage) => void;
}

// Datos de socket inter-servidor
export interface InterServerEvents {
  ping: () => void;
}

// Datos de socket
export interface SocketData {
  userId: string;
  username: string;
  roomId?: string;
}
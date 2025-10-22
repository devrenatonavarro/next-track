// Configuración del cliente Socket.IO

export const SOCKET_CONFIG = {
  // URL del servidor (cambia esto según tu entorno)
  url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
  
  // Opciones de configuración
  options: {
    transports: ['websocket', 'polling'],
    timeout: 5000,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    autoConnect: true,
  },
  
  // Eventos del mapa
  events: {
    // Eventos de conexión
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
    
    // Eventos de mensajes
    MESSAGE: 'message',
    CHAT_MESSAGE: 'chatMessage',
    
    // Eventos del mapa
    GET_MAP_DATA: 'getMapData',
    MAP_DATA: 'mapData',
    LOCATION_UPDATE: 'locationUpdate',
    
    // Eventos de sala
    JOIN_ROOM: 'joinRoom',
    LEAVE_ROOM: 'leaveRoom',
    USER_JOINED: 'userJoined',
    USER_LEFT: 'userLeft',
  }
} as const;

export type SocketEvents = typeof SOCKET_CONFIG.events;
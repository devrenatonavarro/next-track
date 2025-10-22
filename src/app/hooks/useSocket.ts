import { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { SOCKET_CONFIG } from '../config/socket';

interface UseSocketOptions {
  url?: string;
  options?: any;
}

interface SocketState {
  socket: any | null;
  isConnected: boolean;
  error: string | null;
}

export const useSocket = ({ 
  url = SOCKET_CONFIG.url, 
  options = SOCKET_CONFIG.options 
}: UseSocketOptions = {}) => {
  const [socketState, setSocketState] = useState<SocketState>({
    socket: null,
    isConnected: false,
    error: null
  });

  useEffect(() => {
    const socketInstance = io(url, options);

    setSocketState(prev => ({ ...prev, socket: socketInstance }));

    socketInstance.on('connect', () => {
      console.log('Socket conectado');
      setSocketState(prev => ({ 
        ...prev, 
        isConnected: true, 
        error: null 
      }));
    });

    socketInstance.on('disconnect', (reason: string) => {
      console.log('Socket desconectado:', reason);
      setSocketState(prev => ({ 
        ...prev, 
        isConnected: false 
      }));
    });

    socketInstance.on('connect_error', (error: Error) => {
      console.error('Error de conexión:', error);
      setSocketState(prev => ({ 
        ...prev, 
        error: error.message 
      }));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [url]);

  const emit = useCallback((event: string, data?: any) => {
    if (socketState.socket) {
      socketState.socket.emit(event, data);
    }
  }, [socketState.socket]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketState.socket) {
      socketState.socket.on(event, callback);
      
      // Retornar función de cleanup
      return () => {
        if (socketState.socket) {
          socketState.socket.off(event, callback);
        }
      };
    }
  }, [socketState.socket]);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (socketState.socket) {
      socketState.socket.off(event, callback);
    }
  }, [socketState.socket]);

  return {
    socket: socketState.socket,
    isConnected: socketState.isConnected,
    error: socketState.error,
    emit,
    on,
    off
  };
};
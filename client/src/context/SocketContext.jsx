import { createContext, useContext, useEffect, useState } from 'react';
import { socket, connectSocket, disconnectSocket } from '../utils/socket';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [connectedPlayers, setConnectedPlayers] = useState([]);

  useEffect(() => {
    // Connect socket on mount
    connectSocket();

    // Connection handlers
    socket.on('connect', () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connection-established', () => {
      console.log('🎯 Connection established');
    });

    socket.on('clientId', ([playerId, room]) => {
      console.log(`👤 Client ID set: ${playerId} in room ${room}`);
      setClientId(playerId);
    });

    socket.on('connected-Players', ([players]) => {
      console.log('👥 Connected players:', players);
      setConnectedPlayers(players);
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connection-established');
      socket.off('clientId');
      socket.off('connected-Players');
      disconnectSocket();
    };
  }, []);

  const value = {
    socket,
    isConnected,
    clientId,
    connectedPlayers,
    setClientId,
    setConnectedPlayers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

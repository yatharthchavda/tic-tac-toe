import { io } from 'socket.io-client';

// In production, connect to the same origin. In development, use env variable
const SERVER_URL = import.meta.env.MODE === 'production' 
  ? window.location.origin 
  : (import.meta.env.VITE_SERVER_URL || 'http://localhost:5000');

console.log('Socket.IO connecting to:', SERVER_URL);

export const socket = io(SERVER_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// Add connection event logging
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
});

// Connection helpers
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Event emitters
export const checkGameRoom = (username, room) => {
  socket.emit('check-game-room', { username, room });
};

export const readyToStart = () => {
  socket.emit('readyToStart');
};

export const startGame = () => {
  socket.emit('startGame', {});
};

export const sendTurn = (player, pos) => {
  socket.emit('turn', { player, pos });
};

export const sendGameStatus = (status) => {
  socket.emit('game_status', { status });
};

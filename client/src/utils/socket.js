import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const socket = io(SERVER_URL, {
  autoConnect: false,
  withCredentials: true
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

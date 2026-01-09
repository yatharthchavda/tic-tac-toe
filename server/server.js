import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Player } from './models/Player.js';
import { GameRoom } from './models/GameRoom.js';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL || true  // Allow same origin in production
    : process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'top-secret!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

app.use(sessionMiddleware);

// Serve static files from React build (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
}

// Socket.IO setup
const io = new Server(httpServer, {
  cors: process.env.NODE_ENV === 'production' 
    ? { origin: true, credentials: true }  // Allow same-origin in production
    : corsOptions,
  path: '/socket.io/',
  transports: ['websocket', 'polling']
});

// Share session with Socket.IO
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// Global state
const activeGamingRooms = [];
const connectedToPortalUsers = [];

// Helper functions
const getPlayerIdx = (players, sid) => {
  return players.findIndex(player => player.id === sid);
};

const getRoomIdx = (rooms, roomName) => {
  return rooms.findIndex(room => room.name === roomName);
};

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);
  
  const player = new Player(socket.id);
  connectedToPortalUsers.push(player);
  
  socket.emit('connection-established', 'go');

  // Check game room availability
  socket.on('check-game-room', (data) => {
    const { username, room } = data;
    const session = socket.request.session;
    
    const userIdx = getPlayerIdx(connectedToPortalUsers, socket.id);
    if (userIdx !== -1) {
      connectedToPortalUsers[userIdx].setUserName(username);
      connectedToPortalUsers[userIdx].setRequestedGameRoom(room);
    }
    
    let roomIdx = getRoomIdx(activeGamingRooms, room);
    
    // Room doesn't exist, create new one
    if (roomIdx === -1) {
      const newRoom = new GameRoom(room);
      newRoom.addPlayer(connectedToPortalUsers[userIdx]);
      activeGamingRooms.push(newRoom);
      
      socket.join(room);
      socket.emit('tooManyPlayers', 'go');
      console.log(`🎮 Room "${room}" created by ${username}`);
    } else {
      // Room exists, check availability
      if (activeGamingRooms[roomIdx].roomAvailable()) {
        activeGamingRooms[roomIdx].addPlayer(connectedToPortalUsers[userIdx]);
        
        socket.join(room);
        socket.emit('tooManyPlayers', 'go');
        console.log(`🎮 ${username} joined room "${room}"`);
      } else {
        console.log(`❌ Too many players tried to join room "${room}"`);
        socket.emit('tooManyPlayers', 'tooCrowdy');
        socket.disconnect();
        return;
      }
    }
    
    session.username = username;
    session.room = room;
    session.save();
  });

  // Ready to start - player entered lobby
  socket.on('readyToStart', () => {
    const session = socket.request.session;
    const roomIdx = getRoomIdx(activeGamingRooms, session.room);
    
    if (roomIdx === -1) return;
    
    const playerId = activeGamingRooms[roomIdx].getPlayerIdx(socket.id);
    const onlineClients = activeGamingRooms[roomIdx].getClientsInRoom('byName');
    
    socket.emit('clientId', [playerId, session.room]);
    io.to(session.room).emit('connected-Players', [onlineClients]);
    io.to(session.room).emit('status', {
      clientsNbs: onlineClients.length,
      clientId: socket.id
    });
    
    console.log(`👤 ${session.username} ready to start in room "${session.room}"`);
  });

  // Start game - player clicked start button
  socket.on('startGame', (message) => {
    const session = socket.request.session;
    const userIdx = getPlayerIdx(connectedToPortalUsers, socket.id);
    const roomIdx = getRoomIdx(activeGamingRooms, session.room);
    
    if (userIdx === -1 || roomIdx === -1) return;
    
    connectedToPortalUsers[userIdx].setStartGameIntention(true);
    const started = activeGamingRooms[roomIdx].getReadyForGame();
    
    if (started) {
      const activePlayer = activeGamingRooms[roomIdx].getRandomActivePlayer();
      io.to(session.room).emit('start', {
        activePlayer,
        started
      });
      console.log(`🎯 Game started in room "${session.room}" - Player ${activePlayer} goes first`);
    } else {
      socket.emit('waiting second player start');
      console.log(`⏳ Waiting for second player in room "${session.room}"`);
    }
  });

  // Handle turn
  socket.on('turn', (data) => {
    const session = socket.request.session;
    const roomIdx = getRoomIdx(activeGamingRooms, session.room);
    
    if (roomIdx === -1) return;
    
    const activePlayer = activeGamingRooms[roomIdx].getSwapPlayer();
    
    console.log(`🎲 Turn by Player ${data.player}: position ${data.pos}`);
    
    io.to(session.room).emit('turn', {
      recentPlayer: data.player,
      lastPos: data.pos,
      next: activePlayer
    });
  });

  // Game status (restart)
  socket.on('game_status', (msg) => {
    const session = socket.request.session;
    const roomIdx = getRoomIdx(activeGamingRooms, session.room);
    
    if (roomIdx !== -1) {
      activeGamingRooms[roomIdx].startRound();
      console.log(`🔄 Game status: ${msg.status} in room "${session.room}"`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const session = socket.request.session;
    const userIdx = getPlayerIdx(connectedToPortalUsers, socket.id);
    
    if (userIdx === -1) return;
    
    if (session.room) {
      const roomIdx = getRoomIdx(activeGamingRooms, session.room);
      
      if (roomIdx !== -1) {
        const userIdxInRoom = activeGamingRooms[roomIdx].getPlayerIdx(socket.id);
        
        if (userIdxInRoom !== -1) {
          activeGamingRooms[roomIdx].onlineClients.splice(userIdxInRoom, 1);
        }
        
        const onlineClientsCount = activeGamingRooms[roomIdx].getPlayersNumber();
        
        console.log(`❌ Client ${socket.id} disconnected from room "${session.room}"`);
        
        if (onlineClientsCount === 0) {
          const roomName = activeGamingRooms[roomIdx].name;
          activeGamingRooms.splice(roomIdx, 1);
          console.log(`🗑️  Room "${roomName}" closed (no players left)`);
        } else {
          io.to(session.room).emit('disconnect-status', {
            clientsNbs: onlineClientsCount,
            clientId: socket.id
          });
        }
      }
    }
    
    connectedToPortalUsers.splice(userIdx, 1);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API endpoint to get active rooms (for debugging)
app.get('/api/rooms', (req, res) => {
  const rooms = activeGamingRooms.map(room => ({
    name: room.name,
    players: room.getPlayersNumber(),
    active: room.gameRound
  }));
  res.json({ rooms, total: rooms.length });
});

// Serve React app for all other routes (production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

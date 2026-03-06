import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GameRoom } from './game-room.js';
import { SOCKET_EVENTS } from '../shared/constants.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Serve framework from parent directory
app.use('/framework', express.static(path.join(__dirname, '../../framework')));

// Serve shared folder
app.use('/shared', express.static(path.join(__dirname, '../shared')));

// Game rooms (for now, just one main room)
const gameRoom = new GameRoom('main');

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Handle player joining
  socket.on(SOCKET_EVENTS.JOIN_GAME, (data) => {
    const { nickname } = data;
    
    if (!nickname || nickname.trim().length === 0) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid nickname' });
      return;
    }

    const result = gameRoom.addPlayer(socket.id, nickname.trim());
    
    if (!result.success) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: result.error });
      return;
    }

    // Join the socket room
    socket.join('main');

    // Notify player they joined successfully
    socket.emit(SOCKET_EVENTS.PLAYER_JOINED, {
      playerId: socket.id,
      player: result.player,
    });

    // Broadcast lobby update to all players
    io.to('main').emit(SOCKET_EVENTS.LOBBY_UPDATE, gameRoom.getLobbyInfo());

    console.log(`${nickname} joined the game`);
  });

  // Handle player movement input
  socket.on(SOCKET_EVENTS.PLAYER_INPUT, (data) => {
    const { direction } = data;
    gameRoom.handlePlayerInput(socket.id, direction);
  });

  // Handle bomb placement
  socket.on(SOCKET_EVENTS.PLACE_BOMB, () => {
    gameRoom.placeBomb(socket.id);
  });

  // Handle chat messages
  socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (data) => {
    const player = gameRoom.players.get(socket.id);
    if (!player) return;

    const message = {
      nickname: player.nickname,
      text: data.text,
      timestamp: Date.now(),
    };

    io.to('main').emit(SOCKET_EVENTS.CHAT_BROADCAST, message);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const player = gameRoom.players.get(socket.id);
    if (player) {
      console.log(`${player.nickname} disconnected`);
      gameRoom.removePlayer(socket.id);
      
      // Notify others
      io.to('main').emit(SOCKET_EVENTS.PLAYER_LEFT, {
        playerId: socket.id,
        nickname: player.nickname,
      });

      // Update lobby
      io.to('main').emit(SOCKET_EVENTS.LOBBY_UPDATE, gameRoom.getLobbyInfo());
    }
  });
});

// Broadcast lobby updates regularly so timer counts down
setInterval(() => {
  if (gameRoom.state === 'lobby' || gameRoom.state === 'countdown') {
    io.to('main').emit(SOCKET_EVENTS.LOBBY_UPDATE, gameRoom.getLobbyInfo());
  }
}, 1000); // Update every second for countdown

// Broadcast game state at 30 TPS
setInterval(() => {
  if (gameRoom.state === 'playing') {
    const gameState = gameRoom.getGameState();
    io.to('main').emit(SOCKET_EVENTS.GAME_STATE, gameState);
  }
}, 1000 / 30);

// Handle game state changes

// Emit an immediate LOBBY_UPDATE the moment the countdown starts so clients
// see the 10-second timer right away instead of waiting up to 1s for the
// next setInterval tick.
const originalStartCountdown = gameRoom.startCountdown.bind(gameRoom);
gameRoom.startCountdown = function() {
  originalStartCountdown();
  io.to('main').emit(SOCKET_EVENTS.LOBBY_UPDATE, this.getLobbyInfo());
};

const originalStartGame = gameRoom.startGame.bind(gameRoom);
gameRoom.startGame = function() {
  originalStartGame();
  io.to('main').emit(SOCKET_EVENTS.GAME_START, {
    map: this.map,
    players: Array.from(this.players.values()),
  });
};

const originalEndGame = gameRoom.endGame.bind(gameRoom);
gameRoom.endGame = function(winner) {
  const result = originalEndGame(winner);
  io.to('main').emit(SOCKET_EVENTS.GAME_OVER, {
    winner: winner ? {
      id: winner.id,
      nickname: winner.nickname,
    } : null,
  });
  return result;
};

const originalResetGame = gameRoom.resetGame.bind(gameRoom);
gameRoom.resetGame = function() {
  originalResetGame();
  // Notify all clients to return to lobby
  io.to('main').emit(SOCKET_EVENTS.LOBBY_UPDATE, this.getLobbyInfo());
  console.log('Sent reset signal to all clients');
};

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🎮 Bomberman server running on http://localhost:${PORT}`);
});

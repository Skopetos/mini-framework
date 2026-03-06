import { render, createState, setRenderer, getState as getGlobalState } from '../framework/index.js';
import { Lobby } from './components/lobby.js';
import { Game, resetGameLoop } from './components/game.js';
import { GameOver } from './components/game-over.js';
import { SOCKET_EVENTS } from '../shared/constants.js';

// Initialize Socket.IO connection
const socket = io();

// Application state
const { getState, setState } = createState({
  screen: 'lobby', // lobby, game, gameOver
  nickname: '',
  playerId: null,
  lobbyInfo: null,
  gameState: null,
  winner: null,
  error: null,
  chatMessages: [],
});

// Socket event handlers
socket.on(SOCKET_EVENTS.PLAYER_JOINED, (data) => {
  setState({ 
    playerId: data.playerId,
    screen: 'lobby',
  });
});

socket.on(SOCKET_EVENTS.LOBBY_UPDATE, (lobbyInfo) => {
  const state = getState();
  
  // If we're in game or game over and lobby resets, go back to lobby
  if ((state.screen === 'game' || state.screen === 'gameOver') && lobbyInfo.state === 'lobby') {
    resetGameLoop(); // Clean up the game loop
    setState({ 
      screen: 'lobby',
      lobbyInfo,
      gameState: null,
      winner: null,
      chatMessages: [], // Clear chat on new game
    });
  } else {
    // Always update lobby info (including timer)
    setState({ lobbyInfo });
  }
});

socket.on(SOCKET_EVENTS.GAME_START, (data) => {
  resetGameLoop(); // Reset before creating new game loop
  setState({ 
    screen: 'game',
    gameState: {
      state: 'playing',
      map: data.map,
      players: data.players,
      bombs: [],
      explosions: [],
      powerups: [],
    }
  });
});

socket.on(SOCKET_EVENTS.GAME_STATE, (gameState) => {
  const state = getState();
  if (state.screen === 'game') {
    // Update state and trigger re-render
    setState({ gameState });
  }
});

socket.on(SOCKET_EVENTS.GAME_OVER, (data) => {
  resetGameLoop(); // Clean up when game ends
  setState({ 
    screen: 'gameOver',
    winner: data.winner,
  });
});

socket.on(SOCKET_EVENTS.CHAT_BROADCAST, (message) => {
  const state = getState();
  setState({ 
    chatMessages: [...state.chatMessages, message] 
  });
});

socket.on(SOCKET_EVENTS.ERROR, (data) => {
  setState({ error: data.message });
});

socket.on(SOCKET_EVENTS.PLAYER_LEFT, (data) => {
  console.log(`${data.nickname} left the game`);
});

// Exported socket for components to use
export { socket };

// Main App component
function App() {
  const state = getState();

  switch (state.screen) {
    case 'lobby':
      return Lobby(state, socket);
    case 'game':
      return Game(state, socket);
    case 'gameOver':
      return GameOver(state);
    default:
      return Lobby(state, socket);
  }
}

// Setup and initial render
const container = document.getElementById('root');
setRenderer(render, container, App);
render(App(), container);

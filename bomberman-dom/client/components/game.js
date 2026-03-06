import { SOCKET_EVENTS, DIRECTIONS, PLAYER_COLORS, GAME_CONFIG, CELL_TYPES, POWERUP_TYPES } from '../../shared/constants.js';
import { GameLoop } from '../systems/game-loop.js';
import { createGrid } from '../systems/grid.js';
import { createChat } from './chat.js';

// Store game loop OUTSIDE - persist across re-renders
let gameLoop = null;

export function Game(state, socket) {
  const { gameState, playerId, chatMessages } = state;
  
  if (!gameState) {
    return { tag: 'div', children: ['Loading game...'] };
  }

  // Initialize game loop ONCE and persist it
  if (!gameLoop) {
    console.log('Creating new game loop');
    gameLoop = new GameLoop(socket, playerId);
    gameLoop.start();
  } else {
    // Just update the state without recreating
    gameLoop.updateGameState(gameState);
  }

  return {
    tag: 'div',
    attrs: { class: 'game-container' },
    children: [
      {
        tag: 'div',
        attrs: { class: 'game-board-wrapper' },
        children: [
          createHUD(gameState.players),
          createGameBoard(gameState),
        ],
      },
      createChat(chatMessages, socket),
    ],
  };
}

export function resetGameLoop() {
  console.log('Resetting game loop');
  if (gameLoop) {
    gameLoop.stop();
    gameLoop = null;
  }
}

function createHUD(players) {
  return {
    tag: 'div',
    attrs: { class: 'hud' },
    children: players.map(player => ({
      tag: 'div',
      attrs: { class: 'hud-player' },
      children: [
        {
          tag: 'div',
          attrs: {
            class: 'hud-indicator',
            style: `background-color: ${PLAYER_COLORS[player.index]}`,
          },
        },
        {
          tag: 'span',
          attrs: { class: 'hud-name' },
          children: [player.nickname],
        },
        {
          tag: 'span',
          attrs: { class: 'hud-lives' },
          children: [`❤️ ${player.lives}`],
        },
      ],
    })),
  };
}



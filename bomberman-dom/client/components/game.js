import { SOCKET_EVENTS, DIRECTIONS, PLAYER_COLORS, GAME_CONFIG, CELL_TYPES, POWERUP_TYPES } from '../../shared/constants.js';
import { GameLoop } from '../systems/game-loop.js';

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

function createGameBoard(gameState) {
  return {
    tag: 'div',
    attrs: { class: 'game-board', id: 'game-board' },
    children: [
      // Grid (static, rendered once)
      createGrid(gameState.map),
      // Entities container (updated by game loop)
      {
        tag: 'div',
        attrs: { class: 'game-entities', id: 'game-entities' },
        children: [],
      },
    ],
  };
}

function createGrid(map) {
  const cells = [];
  
  for (let y = 0; y < GAME_CONFIG.MAP_SIZE; y++) {
    for (let x = 0; x < GAME_CONFIG.MAP_SIZE; x++) {
      const cellType = map[y][x];
      let className = 'grid-cell cell-empty';
      
      if (cellType === CELL_TYPES.WALL) {
        className = 'grid-cell cell-wall';
      } else if (cellType === CELL_TYPES.BLOCK) {
        className = 'grid-cell cell-block';
      }
      
      cells.push({
        tag: 'div',
        attrs: { class: className },
      });
    }
  }

  return {
    tag: 'div',
    attrs: { class: 'game-grid' },
    children: cells,
  };
}

function createChat(messages, socket) {
  return {
    tag: 'div',
    attrs: { class: 'chat-container' },
    children: [
      {
        tag: 'div',
        attrs: { class: 'chat-header' },
        children: ['💬 Chat'],
      },
      {
        tag: 'div',
        attrs: { class: 'chat-messages', id: 'chat-messages' },
        children: messages.map(msg => ({
          tag: 'div',
          attrs: { class: 'chat-message' },
          children: [
            {
              tag: 'span',
              attrs: { class: 'chat-message-nickname' },
              children: [`${msg.nickname}:`],
            },
            { tag: 'span', children: [msg.text] },
          ],
        })),
      },
      {
        tag: 'div',
        attrs: { class: 'chat-input-container' },
        children: [
          {
            tag: 'input',
            attrs: {
              type: 'text',
              class: 'chat-input',
              placeholder: 'Type a message...',
              onkeydown: (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, {
                    text: e.target.value.trim(),
                  });
                  e.target.value = '';
                }
              },
            },
          },
        ],
      },
    ],
  };
}

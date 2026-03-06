import { createChat } from './chat.js';
import { SOCKET_EVENTS, PLAYER_COLORS } from '../../shared/constants.js';

export function Lobby(state, socket) {
  const { nickname, playerId, lobbyInfo, error, chatMessages } = state;

  // If player hasn't joined yet, show nickname input
  if (!playerId) {
    return {
      tag: 'div',
      attrs: { class: 'lobby-container' },
      children: [
        { tag: 'h1', children: ['💣 BOMBERMAN'] },
        {
          tag: 'input',
          attrs: {
            type: 'text',
            class: 'nickname-input',
            placeholder: 'Enter your nickname',
            value: nickname,
          },
        },
        {
          tag: 'button',
          attrs: {
            class: 'join-button',
            onclick: () => {
              const input = document.querySelector('.nickname-input');
              const nick = input.value.trim();
              if (nick) {
                socket.emit(SOCKET_EVENTS.JOIN_GAME, { nickname: nick });
              }
            },
          },
          children: ['Join Game'],
        },
        error ? {
          tag: 'div',
          attrs: { class: 'error-message' },
          children: [error],
        } : null,
      ].filter(Boolean),
    };
  }

  // Show lobby waiting room
  const playerCount = lobbyInfo?.playerCount || 0;
  const players = lobbyInfo?.players || [];
  const isCountdown = lobbyInfo?.state === 'countdown';
  const timeRemaining = lobbyInfo?.timeRemaining;

  let countdownMessage = 'Waiting for at least 2 players to start...';
  
  if (isCountdown && timeRemaining) {
    countdownMessage = `Game starting in ${timeRemaining} seconds...`;
  } else if (playerCount >= 2 && timeRemaining) {
    countdownMessage = `Starting in ${timeRemaining} seconds (or when 4 players join)...`;
  } else if (playerCount >= 2) {
    countdownMessage = 'Waiting for more players...';
  }

  return {
    tag: 'div',
    attrs: { class: 'lobby-screen' },
    children: [
      {
        tag: 'div',
        attrs: { class: 'lobby-container' },
        children: [
          { tag: 'h1', children: ['💣 BOMBERMAN'] },
          {
            tag: 'div',
            attrs: { class: 'player-counter' },
            children: [`Players: ${playerCount}/4`],
          },
          {
            tag: 'ul',
            attrs: { class: 'player-list' },
            children: players.map(p => ({
              tag: 'li',
              children: [
                {
                  tag: 'div',
                  attrs: {
                    class: 'player-indicator',
                    style: `background-color: ${PLAYER_COLORS[p.index]}`,
                  },
                },
                { tag: 'span', children: [p.nickname] },
              ],
            })),
          },
          {
            tag: 'div',
            attrs: { class: isCountdown ? 'countdown' : 'waiting-message' },
            children: [countdownMessage],
          },
        ],
      },
      createChat(chatMessages, socket),
    ]
  };
}


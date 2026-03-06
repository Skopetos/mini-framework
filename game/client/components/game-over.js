import { setState } from '../../framework/index.js';
import { resetGameLoop } from './game.js';

export function GameOver(state, socket) {
  const { winner } = state;

  function returnToLobby() {
    resetGameLoop();
    setState({
      screen: 'lobby',
      gameState: null,
      winner: null,
    });
  }

  function changeNickname() {
    resetGameLoop();
    // Disconnect so the server removes us from the room, then reconnect fresh
    socket.disconnect();
    socket.connect();
    setState({
      screen: 'lobby',
      gameState: null,
      winner: null,
      playerId: null,
      nickname: '',
      lobbyInfo: null,
      chatMessages: [],
    });
  }

  return {
    tag: 'div',
    attrs: { class: 'game-over' },
    children: [
      { tag: 'h1', children: ['GAME OVER'] },
      winner ? {
        tag: 'div',
        attrs: { class: 'winner-name' },
        children: [`🏆 ${winner.nickname} wins!`],
      } : {
        tag: 'div',
        attrs: { class: 'winner-name' },
        children: ['Draw!'],
      },
      {
        tag: 'div',
        attrs: { class: 'game-over-buttons' },
        children: [
          {
            tag: 'button',
            attrs: {
              class: 'play-again-button',
              onclick: returnToLobby,
            },
            children: ['Return to Lobby'],
          },
          {
            tag: 'button',
            attrs: {
              class: 'play-again-button secondary',
              onclick: changeNickname,
            },
            children: ['Change Nickname'],
          },
        ],
      },
    ],
  };
}

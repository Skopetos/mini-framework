export function GameOver(state) {
  const { winner } = state;

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
        tag: 'button',
        attrs: {
          class: 'play-again-button',
          onclick: () => {
            window.location.reload();
          },
        },
        children: ['Play Again'],
      },
    ],
  };
}

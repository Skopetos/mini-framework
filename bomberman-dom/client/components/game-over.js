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
        tag: 'div',
        attrs: {
          class: 'play-again-button disabled',
        },
        children: ['Returning to lobby...'],
      },
    ],
  };
}

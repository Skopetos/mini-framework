import { GAME_CONFIG, CELL_TYPES } from '../../shared/constants.js';

export function createGrid(map) {
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

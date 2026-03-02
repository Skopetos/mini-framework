import { GAME_CONFIG, CELL_TYPES, STARTING_POSITIONS } from '../shared/constants.js';

/**
 * Generates a Bomberman map with walls and blocks
 * Walls are fixed in a pattern, blocks are random
 * Starting positions are kept safe
 */
export function generateMap() {
  const size = GAME_CONFIG.MAP_SIZE;
  const map = Array(size).fill(null).map(() => Array(size).fill(CELL_TYPES.EMPTY));

  // Place outer walls
  for (let i = 0; i < size; i++) {
    map[0][i] = CELL_TYPES.WALL;
    map[size - 1][i] = CELL_TYPES.WALL;
    map[i][0] = CELL_TYPES.WALL;
    map[i][size - 1] = CELL_TYPES.WALL;
  }

  // Place inner walls (classic Bomberman pattern - every other cell)
  for (let y = 2; y < size - 2; y += 2) {
    for (let x = 2; x < size - 2; x += 2) {
      map[y][x] = CELL_TYPES.WALL;
    }
  }

  // Place random blocks (avoid starting positions and their adjacent cells)
  const safeZones = new Set();
  STARTING_POSITIONS.forEach(pos => {
    // Mark starting position and adjacent cells as safe
    safeZones.add(`${pos.x},${pos.y}`);
    safeZones.add(`${pos.x + 1},${pos.y}`);
    safeZones.add(`${pos.x - 1},${pos.y}`);
    safeZones.add(`${pos.x},${pos.y + 1}`);
    safeZones.add(`${pos.x},${pos.y - 1}`);
  });

  // Fill with blocks (about 60% of empty spaces)
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (map[y][x] === CELL_TYPES.EMPTY && !safeZones.has(`${x},${y}`)) {
        if (Math.random() < 0.6) {
          map[y][x] = CELL_TYPES.BLOCK;
        }
      }
    }
  }

  return map;
}

/**
 * Check if a position is walkable
 */
export function isWalkable(map, x, y) {
  if (x < 0 || x >= GAME_CONFIG.MAP_SIZE || y < 0 || y >= GAME_CONFIG.MAP_SIZE) {
    return false;
  }
  return map[y][x] === CELL_TYPES.EMPTY;
}

/**
 * Get neighboring cells in 4 directions
 */
export function getNeighbors(x, y) {
  return [
    { x: x, y: y - 1 }, // up
    { x: x, y: y + 1 }, // down
    { x: x - 1, y: y }, // left
    { x: x + 1, y: y }, // right
  ];
}

// Game Configuration
export const GAME_CONFIG = {
  MAP_SIZE: 17,
  CELL_SIZE: 40, // pixels
  TICK_RATE: 30, // server ticks per second
  MAX_PLAYERS: 4,
  MIN_PLAYERS: 2,
  LOBBY_WAIT_TIME: 20000, // 20 seconds
  COUNTDOWN_TIME: 10000, // 10 seconds
  PLAYER_LIVES: 3,
  BOMB_TIMER: 3000, // 3 seconds until explosion
  EXPLOSION_DURATION: 500, // 0.4 seconds
  GAME_OVER_DELAY: 10000, // 10 seconds before auto-returning to lobby
  MOVE_COOLDOWN_BASE: 220, // ms between moves at speed 1
  MOVE_COOLDOWN_STEP: 55,  // ms reduction per extra speed level
  MOVE_COOLDOWN_MIN: 55,   // minimum ms between moves (speed ~4)
  POWERUP_SPAWN_INTERVAL: 30000, // ms between periodic random powerup spawns
  BOMB_PASS_DURATION: 10000,     // ms that a single bomb-pass pickup lasts
};

// Grid cell types
export const CELL_TYPES = {
  EMPTY: 0,
  WALL: 1,
  BLOCK: 2,
  EXPLOSION: 3,
};

// Player directions
export const DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
};

// Power-up types
export const POWERUP_TYPES = {
  BOMB: 'bomb',        // +1 bomb capacity
  FLAMES: 'flames',    // +1 explosion range
  SPEED: 'speed',      // +1 movement speed
  ONE_UP: 'oneup',     // +1 life
  BOMB_PASS: 'bombpass', // pass through bombs for BOMB_PASS_DURATION ms (stackable)
};

// Player starting positions (corners of 17x17 grid)
export const STARTING_POSITIONS = [
  { x: 1, y: 1 },      // Top-left
  { x: 15, y: 1 },     // Top-right
  { x: 1, y: 15 },     // Bottom-left
  { x: 15, y: 15 },    // Bottom-right
];

// Player colors for visual distinction
export const PLAYER_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Cyan
  '#FFE66D', // Yellow
  '#95E1D3', // Green
];

// Socket event types
export const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_GAME: 'join_game',
  PLAYER_INPUT: 'player_input',
  PLACE_BOMB: 'place_bomb',
  CHAT_MESSAGE: 'chat_message',
  
  // Server -> Client
  LOBBY_UPDATE: 'lobby_update',
  GAME_START: 'game_start',
  GAME_STATE: 'game_state',
  GAME_OVER: 'game_over',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  CHAT_BROADCAST: 'chat_broadcast',
  ERROR: 'error',
};

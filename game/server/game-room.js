import { GAME_CONFIG, CELL_TYPES, STARTING_POSITIONS, DIRECTIONS, POWERUP_TYPES } from '../shared/constants.js';
import { generateMap, isWalkable } from './map-generator.js';

/**
 * Game Room - Manages a single game instance
 */
export class GameRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = new Map(); // socketId -> player object
    this.state = 'lobby'; // lobby, countdown, playing, ended
    this.map = null;
    this.bombs = [];
    this.explosions = [];
    this.powerups = [];
    this.lobbyTimer = null;
    this.lobbyStartTime = null;
    this.countdownTimer = null;
    this.countdownValue = null;
    this.tickInterval = null;
    this.powerupSpawnInterval = null;
    this.tick = 0;
  }

  /**
   * Add a player to the room
   */
  addPlayer(socketId, nickname) {
    if (this.players.size >= GAME_CONFIG.MAX_PLAYERS) {
      return { success: false, error: 'Room is full' };
    }

    if (this.state !== 'lobby') {
      return { success: false, error: 'Game already started' };
    }

    const playerIndex = this.players.size;
    const startPos = STARTING_POSITIONS[playerIndex];

    const player = {
      id: socketId,
      nickname,
      x: startPos.x,
      y: startPos.y,
      lives: GAME_CONFIG.PLAYER_LIVES,
      bombCapacity: 1,
      bombRange: 1,
      speed: 1,
      alive: true,
      powerups: [],
      index: playerIndex,
      lastMoveTime: 0,
      bombPassExpiry: 0,
    };

    this.players.set(socketId, player);

    // Check if we should start countdown
    this.checkLobbyStatus();

    return { success: true, player };
  }

  /**
   * Remove a player from the room
   */
  removePlayer(socketId) {
    this.players.delete(socketId);

    // If game is in progress, check win condition
    if (this.state === 'playing') {
      this.checkWinCondition();
    } else if (this.state === 'countdown' && this.players.size < GAME_CONFIG.MAX_PLAYERS) {
      // A player left during countdown – cancel it and return to lobby
      console.log('[removePlayer] player left during countdown, reverting to lobby');
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
      this.countdownValue = null;
      this.state = 'lobby';
      this.checkLobbyStatus();
    }
  }

  /**
   * Check lobby status and start timers if needed
   */
  checkLobbyStatus() {
    if (this.state !== 'lobby') return;

    const playerCount = this.players.size;

    // If we have 4 players, start countdown immediately
    if (playerCount === GAME_CONFIG.MAX_PLAYERS) {
      this.startCountdown();
    }
    // If we have 2-3 players and no timer, start lobby timer
    else if (playerCount >= GAME_CONFIG.MIN_PLAYERS && !this.lobbyTimer) {
      this.lobbyStartTime = Date.now();
      this.lobbyTimer = setTimeout(() => {
        this.startCountdown();
      }, GAME_CONFIG.LOBBY_WAIT_TIME);
    }
    // If we drop below 2 players, cancel timers
    else if (playerCount < GAME_CONFIG.MIN_PLAYERS) {
      if (this.lobbyTimer) {
        clearTimeout(this.lobbyTimer);
        this.lobbyTimer = null;
        this.lobbyStartTime = null;
      }
    }
  }

  /**
   * Start the countdown before game starts
   */
  startCountdown() {
    if (this.state !== 'lobby') return;

    this.state = 'countdown';
    this.countdownValue = Math.ceil(GAME_CONFIG.COUNTDOWN_TIME / 1000);
    console.log(`[startCountdown] state=countdown, countdownValue=${this.countdownValue}, countdownTimer before=${this.countdownTimer}`);

    this.countdownTimer = setInterval(() => {
      this.countdownValue--;
      console.log(`[countdown] tick: countdownValue=${this.countdownValue}, state=${this.state}`);
      if (this.countdownValue <= 0) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        console.log('[countdown] reached 0, calling startGame()');
        this.startGame();
      }
    }, 1000);
  }

  /**
   * Start the game
   */
  startGame() {
    this.state = 'playing';
    this.map = generateMap();
    
    // Start game tick loop
    const tickRate = 1000 / GAME_CONFIG.TICK_RATE;
    this.tickInterval = setInterval(() => {
      this.gameTick();
    }, tickRate);

    // Periodically spawn a random powerup on an empty cell
    this.powerupSpawnInterval = setInterval(() => {
      this.spawnRandomPowerup();
    }, GAME_CONFIG.POWERUP_SPAWN_INTERVAL);
  }

  /**
   * Main game tick - runs at 30 TPS
   */
  gameTick() {
    this.tick++;

    // Update bombs
    this.updateBombs();

    // Update explosions
    this.updateExplosions();

    // Check collisions with explosions
    this.checkExplosionCollisions();

    // Check win condition
    this.checkWinCondition();
  }

  /**
   * Handle player input (movement)
   */
  handlePlayerInput(socketId, direction) {
    const player = this.players.get(socketId);
    if (!player || !player.alive || this.state !== 'playing') return;

    // Enforce movement cooldown – speed powerup reduces the delay
    const now = Date.now();
    const cooldown = Math.max(
      GAME_CONFIG.MOVE_COOLDOWN_MIN,
      GAME_CONFIG.MOVE_COOLDOWN_BASE - (player.speed - 1) * GAME_CONFIG.MOVE_COOLDOWN_STEP
    );
    if (now - player.lastMoveTime < cooldown) return;
    player.lastMoveTime = now;

    let newX = player.x;
    let newY = player.y;

    switch (direction) {
      case DIRECTIONS.UP:
        newY -= 1;
        break;
      case DIRECTIONS.DOWN:
        newY += 1;
        break;
      case DIRECTIONS.LEFT:
        newX -= 1;
        break;
      case DIRECTIONS.RIGHT:
        newX += 1;
        break;
    }

    // Check if new position is valid
    if (this.canMoveTo(newX, newY, player)) {
      player.x = newX;
      player.y = newY;

      // Check if player picked up a powerup
      this.checkPowerupCollection(player);
    }
  }

  /**
   * Check if a position is valid for movement
   */
  canMoveTo(x, y, player = null) {
    // Check map boundaries and walls/blocks
    if (!isWalkable(this.map, x, y)) {
      return false;
    }

    // Check if there's a bomb at this position (skip if player has bomb pass active)
    const hasBombPass = player && Date.now() < player.bombPassExpiry;
    if (!hasBombPass) {
      const bombAtPos = this.bombs.find(b => b.x === x && b.y === y);
      if (bombAtPos) {
        return false;
      }
    }

    return true;
  }

  /**
   * Place a bomb
   */
  placeBomb(socketId) {
    const player = this.players.get(socketId);
    if (!player || !player.alive || this.state !== 'playing') return;

    // Check if player has available bombs
    const playerBombCount = this.bombs.filter(b => b.playerId === socketId).length;
    if (playerBombCount >= player.bombCapacity) return;

    // Check if there's already a bomb at this position
    const bombAtPos = this.bombs.find(b => b.x === player.x && b.y === player.y);
    if (bombAtPos) return;

    // Place the bomb
    const bomb = {
      id: `${socketId}-${this.tick}`,
      playerId: socketId,
      x: player.x,
      y: player.y,
      range: player.bombRange,
      timer: GAME_CONFIG.BOMB_TIMER,
      placedAt: Date.now(),
    };

    this.bombs.push(bomb);
    console.log(`💣 Bomb placed by ${player.nickname} at grid (${bomb.x}, ${bomb.y})`);
  }

  /**
   * Update all bombs
   */
  updateBombs() {
    const now = Date.now();
    const bombsToExplode = [];

    this.bombs = this.bombs.filter(bomb => {
      if (now - bomb.placedAt >= bomb.timer) {
        bombsToExplode.push(bomb);
        return false;
      }
      return true;
    });

    // Explode bombs
    bombsToExplode.forEach(bomb => this.explodeBomb(bomb));
  }

  /**
   * Explode a bomb
   */
  explodeBomb(bomb) {
    const explosionCells = [{ x: bomb.x, y: bomb.y }];

    // Spread in 4 directions
    const directions = [
      { dx: 0, dy: -1 }, // up
      { dx: 0, dy: 1 },  // down
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 },  // right
    ];

    directions.forEach(dir => {
      for (let i = 1; i <= bomb.range; i++) {
        const x = bomb.x + dir.dx * i;
        const y = bomb.y + dir.dy * i;

        // Stop at walls
        if (this.map[y]?.[x] === CELL_TYPES.WALL) break;

        explosionCells.push({ x, y });

        // Destroy blocks and stop
        if (this.map[y]?.[x] === CELL_TYPES.BLOCK) {
          this.map[y][x] = CELL_TYPES.EMPTY;
          this.spawnPowerup(x, y);
          break;
        }
      }
    });

    // Create explosion
    const explosion = {
      id: `exp-${this.tick}`,
      cells: explosionCells,
      createdAt: Date.now(),
      damagedPlayers: new Set(),
    };

    this.explosions.push(explosion);
    console.log(`💥 Bomb exploded at (${bomb.x}, ${bomb.y}) affecting ${explosionCells.length} cells`);
  }

  /**
   * Update explosions (remove expired ones)
   */
  updateExplosions() {
    const now = Date.now();
    this.explosions = this.explosions.filter(
      exp => now - exp.createdAt < GAME_CONFIG.EXPLOSION_DURATION
    );
  }

  /**
   * Check if players are hit by explosions
   */
  checkExplosionCollisions() {
    this.explosions.forEach(explosion => {
      explosion.cells.forEach(cell => {
        this.players.forEach(player => {
          if (player.alive && player.x === cell.x && player.y === cell.y && !explosion.damagedPlayers.has(player.id)) {
            explosion.damagedPlayers.add(player.id);
            player.lives--;
            console.log(`💔 ${player.nickname} hit by explosion! Lives remaining: ${player.lives}`);
            if (player.lives <= 0) {
              player.alive = false;
              console.log(`☠️  ${player.nickname} died!`);
              this.dropPowerupOnDeath(player);
            }
          }
        });
      });
    });
  }

  /**
   * Spawn a powerup with random chance
   */
  spawnPowerup(x, y) {
    // 30% chance to spawn a powerup
    if (Math.random() > 0.3) return;

    const types = Object.values(POWERUP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];

    this.powerups.push({
      id: `powerup-${this.tick}`,
      type,
      x,
      y,
    });
  }

  /**
   * Spawn a powerup on a random empty cell (periodic timer)
   */
  spawnRandomPowerup() {
    if (this.state !== 'playing' || !this.map) return;

    const size = GAME_CONFIG.MAP_SIZE;
    const occupiedCells = new Set();

    // Mark cells occupied by players, bombs, or existing powerups
    this.players.forEach(p => occupiedCells.add(`${p.x},${p.y}`));
    this.bombs.forEach(b => occupiedCells.add(`${b.x},${b.y}`));
    this.powerups.forEach(p => occupiedCells.add(`${p.x},${p.y}`));

    // Collect all eligible empty cells
    const candidates = [];
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        if (this.map[y][x] === CELL_TYPES.EMPTY && !occupiedCells.has(`${x},${y}`)) {
          candidates.push({ x, y });
        }
      }
    }

    if (candidates.length === 0) return;

    const pos = candidates[Math.floor(Math.random() * candidates.length)];
    const types = Object.values(POWERUP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];

    this.powerups.push({
      id: `powerup-${this.tick}-rng`,
      type,
      x: pos.x,
      y: pos.y,
    });
    console.log(`⭐ Periodic powerup [${type}] spawned at (${pos.x}, ${pos.y})`);
  }

  /**
   * Drop a powerup when a player dies.
   * Drops one of their collected powerups, or a random one if they had none.
   */
  dropPowerupOnDeath(player) {
    const types = Object.values(POWERUP_TYPES);

    let type;
    if (player.powerups.length > 0) {
      // Drop the last collected powerup
      type = player.powerups.pop();
    } else {
      // No powerups – drop a random one
      type = types[Math.floor(Math.random() * types.length)];
    }

    // Don't drop if the cell is already occupied by another powerup
    const alreadyHere = this.powerups.find(p => p.x === player.x && p.y === player.y);
    if (alreadyHere) return;

    this.powerups.push({
      id: `powerup-${this.tick}-drop`,
      type,
      x: player.x,
      y: player.y,
    });
    console.log(`🎁 ${player.nickname} dropped [${type}] at (${player.x}, ${player.y})`);
  }

  /**
   * Check if player collected a powerup
   */
  checkPowerupCollection(player) {
    const powerupIndex = this.powerups.findIndex(
      p => p.x === player.x && p.y === player.y
    );

    if (powerupIndex !== -1) {
      const powerup = this.powerups[powerupIndex];
      this.powerups.splice(powerupIndex, 1);

      // Apply powerup effect
      switch (powerup.type) {
        case POWERUP_TYPES.BOMB:
          player.bombCapacity++;
          break;
        case POWERUP_TYPES.FLAMES:
          player.bombRange++;
          break;
        case POWERUP_TYPES.SPEED:
          player.speed++;
          break;
        case POWERUP_TYPES.ONE_UP:
          player.lives++;
          console.log(`❤️  ${player.nickname} got 1 Up! Lives: ${player.lives}`);
          break;
        case POWERUP_TYPES.BOMB_PASS: {
          // Stack on top of any remaining duration
          const remaining = Math.max(0, player.bombPassExpiry - Date.now());
          player.bombPassExpiry = Date.now() + remaining + GAME_CONFIG.BOMB_PASS_DURATION;
          console.log(`🛡️  ${player.nickname} got Bomb Pass! Active for ${Math.ceil((player.bombPassExpiry - Date.now()) / 1000)}s`);
          break;
        }
      }

      player.powerups.push(powerup.type);
    }
  }

  /**
   * Check if game is over
   */
  checkWinCondition() {
    const alivePlayers = Array.from(this.players.values()).filter(p => p.alive);

    if (alivePlayers.length <= 1) {
      this.endGame(alivePlayers[0] || null);
    }
  }

  /**
   * End the game
   */
  endGame(winner) {
    this.state = 'ended';
    
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    if (this.powerupSpawnInterval) {
      clearInterval(this.powerupSpawnInterval);
      this.powerupSpawnInterval = null;
    }

    // Reset game after the configured delay
    setTimeout(() => {
      this.resetGame();
    }, GAME_CONFIG.GAME_OVER_DELAY);

    return winner;
  }

  /**
   * Reset the game room for a new game
   */
  resetGame() {
    // Clear all game state
    this.state = 'lobby';
    this.map = null;
    this.bombs = [];
    this.explosions = [];
    this.powerups = [];
    this.tick = 0;

    console.log(`[resetGame] before clear: lobbyTimer=${!!this.lobbyTimer}, countdownTimer=${!!this.countdownTimer}, countdownValue=${this.countdownValue}`);
    if (this.lobbyTimer) {
      clearTimeout(this.lobbyTimer);
      this.lobbyTimer = null;
      this.lobbyStartTime = null;
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.countdownValue = null;

    // Reset all players
    let playerIndex = 0;
    this.players.forEach(player => {
      const startPos = STARTING_POSITIONS[playerIndex];
      player.x = startPos.x;
      player.y = startPos.y;
      player.lives = GAME_CONFIG.PLAYER_LIVES;
      player.bombCapacity = 1;
      player.bombRange = 1;
      player.speed = 1;
      player.alive = true;
      player.powerups = [];
      player.index = playerIndex;
      player.lastMoveTime = 0;
      player.bombPassExpiry = 0;
      playerIndex++;
    });

    // Check if we can start a new game
    this.checkLobbyStatus();
    
    console.log('Game reset - back to lobby');
  }

  /**
   * Get serializable game state
   */
  getGameState() {
    return {
      state: this.state,
      tick: this.tick,
      map: this.map,
      players: Array.from(this.players.values()),
      bombs: this.bombs,
      explosions: this.explosions,
      powerups: this.powerups,
    };
  }

  /**
   * Get lobby info
   */
  getLobbyInfo() {
    let timeRemaining = null;

    if (this.state === 'countdown') {
      // Use the integer countdownValue driven by the same setInterval as startGame()
      timeRemaining = this.countdownValue;
    } else if (this.lobbyTimer && this.lobbyStartTime) {
      const now = Date.now();
      const msLeft = Math.max(0, GAME_CONFIG.LOBBY_WAIT_TIME - (now - this.lobbyStartTime));
      timeRemaining = msLeft > 0 ? Math.ceil(msLeft / 1000) : null;
    }

    return {
      playerCount: this.players.size,
      players: Array.from(this.players.values()).map(p => ({
        nickname: p.nickname,
        index: p.index,
      })),
      state: this.state,
      timeRemaining,
    };
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.lobbyTimer) clearTimeout(this.lobbyTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.powerupSpawnInterval) clearInterval(this.powerupSpawnInterval);
  }
}

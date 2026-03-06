import {
  SOCKET_EVENTS,
  DIRECTIONS,
  PLAYER_COLORS,
  GAME_CONFIG,
  POWERUP_TYPES,
  CELL_TYPES,
} from "../../shared/constants.js";
import { spriteLoader } from "./sprite-loader.js";

/**
 * Game Loop - Handles 60fps rendering and input
 * Separates rendering from server state updates (30 TPS)
 */
export class GameLoop {
  constructor(socket, playerId) {
    this.socket = socket;
    this.playerId = playerId;
    this.gameState = null;
    this.entities = new Map(); // DOM element pool
    this.lastTime = 0;
    this.running = false;
    this.frameCount = 0;
    this.fpsDisplay = 0;
    this.lastFpsUpdate = 0;
    this.lastMapState = null;

    // Expose to window for direct updates
    window.currentGameLoop = this;

    // Load sprites asynchronously
    spriteLoader.loadSprites();

    // Input handling
    this.setupInput();
  }

  setupInput() {
    // Keyboard input for movement and bomb
    const keys = new Set();

    window.addEventListener("keydown", (e) => {
      // Prevent game input when typing in chat or other input fields
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      if (keys.has(e.key)) return; // Prevent repeat
      keys.add(e.key);

      let direction = null;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          direction = DIRECTIONS.UP;
          break;
        case "ArrowDown":
        case "s":
        case "S":
          direction = DIRECTIONS.DOWN;
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          direction = DIRECTIONS.LEFT;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          direction = DIRECTIONS.RIGHT;
          break;
        case " ":
        case "Enter":
          // Place bomb
          this.socket.emit(SOCKET_EVENTS.PLACE_BOMB);
          e.preventDefault();
          return;
      }

      if (direction) {
        this.socket.emit(SOCKET_EVENTS.PLAYER_INPUT, { direction });
        e.preventDefault();
      }
    });

    window.addEventListener("keyup", (e) => {
      // Don't track keyup when in input fields
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }
      keys.delete(e.key);
    });
  }

  updateGameState(newState) {
    this.gameState = newState;
  }

  start() {
    if (this.running) return; // Prevent double-starting
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }

  stop() {
    this.running = false;
    window.currentGameLoop = null;
  }

  loop(currentTime) {
    if (!this.running) return;

    const deltaTime = currentTime - this.lastTime;

    // Update FPS counter
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.fpsDisplay = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;

      // Log FPS if below target
      if (this.fpsDisplay < 58) {
        console.warn(`FPS: ${this.fpsDisplay}`);
      }
    }

    // Render game entities
    if (this.gameState) {
      this.render();
    }

    this.lastTime = currentTime;
    requestAnimationFrame((time) => this.loop(time));
  }
  renderGrid() {
    const { map } = this.gameState;
    const gameBoard = document.getElementById("game-board");

    // Simple check: if lastMapState exists and is different, update DOM
    if (this.lastMapState !== JSON.stringify(map)) {
      this.lastMapState = JSON.stringify(map); // Update last state

      // Clear existing grid cells
      const existingGrid = gameBoard.querySelector(".game-grid");
      if (existingGrid) {
        existingGrid.remove();
      }

      // Create and append the new grid
      const grid = document.createElement("div");
      grid.className = "game-grid";

      for (let y = 0; y < GAME_CONFIG.MAP_SIZE; y++) {
        for (let x = 0; x < GAME_CONFIG.MAP_SIZE; x++) {
          const cellType = map[y][x];
          const cell = document.createElement("div");

          let className = "grid-cell cell-empty";
          if (cellType === CELL_TYPES.WALL) {
            className = "grid-cell cell-wall";
          } else if (cellType === CELL_TYPES.BLOCK) {
            className = "grid-cell cell-block";
          }

          cell.className = className;
          grid.appendChild(cell);
        }
      }
      // Make sure it's inserted before the entities container
      const entitiesContainer = gameBoard.querySelector(".game-entities");
      gameBoard.insertBefore(grid, entitiesContainer);
    }
  }

  render() {
    const container = document.getElementById("game-entities");
    if (!container) return;
    this.renderGrid();

    const { players, bombs, explosions, powerups } = this.gameState;

    // DEBUG: Log what we're trying to render
    if (bombs && bombs.length > 0) {
      console.log("RENDER DEBUG - Bombs:", bombs);
    }
    if (explosions && explosions.length > 0) {
      console.log("RENDER DEBUG - Explosions:", explosions);
    }
    if (powerups && powerups.length > 0) {
      console.log("RENDER DEBUG - Powerups:", powerups);
    }

    // Track active entity IDs
    const activeIds = new Set();

    // Render players
    players.forEach((player) => {
      const id = `player-${player.id}`;
      activeIds.add(id);
      this.renderPlayer(container, player, id);
    });

    // Render bombs
    bombs.forEach((bomb) => {
      const id = `bomb-${bomb.id}`;
      activeIds.add(id);
      this.renderBomb(container, bomb, id);
    });

    // Render explosions
    explosions.forEach((explosion) => {
      explosion.cells.forEach((cell, index) => {
        const id = `explosion-${explosion.id}-${index}`;
        activeIds.add(id);
        this.renderExplosion(container, cell, id);
      });
    });

    // Render powerups
    powerups.forEach((powerup) => {
      const id = `powerup-${powerup.id}`;
      activeIds.add(id);
      this.renderPowerup(container, powerup, id);
    });

    // Remove inactive entities
    this.entities.forEach((element, id) => {
      if (!activeIds.has(id)) {
        element.remove();
        this.entities.delete(id);
      }
    });
  }

  renderPlayer(container, player, id) {
    let element = this.entities.get(id);

    if (!element) {
      element = document.createElement("div");
      element.className = "player";

      // Use sprite if available, otherwise fallback to CSS
      const playerColors = ["red", "cyan", "yellow", "green"];
      const spriteKey = `player-${playerColors[player.index]}`;

      if (spriteLoader.hasSprite(spriteKey)) {
        element.style.backgroundImage = `url(${spriteLoader.getSprite(
          spriteKey
        )})`;
        element.style.backgroundSize = "cover";
      } else {
        element.style.backgroundColor = PLAYER_COLORS[player.index];
        element.textContent = player.nickname[0].toUpperCase();
      }

      container.appendChild(element);
      this.entities.set(id, element);
      console.log(
        `Created player ${player.nickname} at (${player.x}, ${player.y})`
      );
    }

    // Update position
    const x = player.x * GAME_CONFIG.CELL_SIZE;
    const y = player.y * GAME_CONFIG.CELL_SIZE;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;

    // Update alive status
    if (!player.alive) {
      element.classList.add("dead");
    } else {
      element.classList.remove("dead");
    }
  }

  renderBomb(container, bomb, id) {
    let element = this.entities.get(id);

    if (!element) {
      element = document.createElement("div");
      element.className = "bomb";

      console.log(
        `Creating bomb element at grid (${bomb.x}, ${
          bomb.y
        }), pixel (${bomb.x * GAME_CONFIG.CELL_SIZE}, ${
          bomb.y * GAME_CONFIG.CELL_SIZE
        })`
      );

      // Use sprite if available
      if (spriteLoader.hasSprite("bomb")) {
        element.style.backgroundImage = `url(${spriteLoader.getSprite(
          "bomb"
        )})`;
        element.style.backgroundSize = "cover";
        element.classList.add("sprite-mode");
      }

      container.appendChild(element);
      this.entities.set(id, element);
    }

    const x = bomb.x * GAME_CONFIG.CELL_SIZE;
    const y = bomb.y * GAME_CONFIG.CELL_SIZE;
    console.log(`Positioning bomb ${id} to pixel (${x}, ${y})`);
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  }

  renderExplosion(container, cell, id) {
    let element = this.entities.get(id);

    if (!element) {
      element = document.createElement("div");
      element.className = "explosion";

      console.log(`Creating explosion at grid (${cell.x}, ${cell.y})`);

      // Use sprite if available
      if (spriteLoader.hasSprite("explosion")) {
        element.style.backgroundImage = `url(${spriteLoader.getSprite(
          "explosion"
        )})`;
        element.style.backgroundSize = "cover";
      }

      container.appendChild(element);
      this.entities.set(id, element);
    }

    const x = cell.x * GAME_CONFIG.CELL_SIZE;
    const y = cell.y * GAME_CONFIG.CELL_SIZE;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  }

  renderPowerup(container, powerup, id) {
    let element = this.entities.get(id);

    if (!element) {
      element = document.createElement("div");
      element.className = "powerup";

      console.log(
        `Creating powerup ${powerup.type} at grid (${powerup.x}, ${powerup.y})`
      );

      const spriteKey = `powerup-${powerup.type}`;

      if (spriteLoader.hasSprite(spriteKey)) {
        element.style.backgroundImage = `url(${spriteLoader.getSprite(
          spriteKey
        )})`;
        element.style.backgroundSize = "cover";
      } else {
        // Fallback to emoji
        switch (powerup.type) {
          case POWERUP_TYPES.BOMB:
            element.textContent = "💣";
            break;
          case POWERUP_TYPES.FLAMES:
            element.textContent = "🔥";
            break;
          case POWERUP_TYPES.SPEED:
            element.textContent = "⚡";
            break;
          case POWERUP_TYPES.ONE_UP:
            element.textContent = "❤️";
            break;
          case POWERUP_TYPES.BOMB_PASS:
            element.textContent = "🌀";
            break;
        }
      }

      container.appendChild(element);
      this.entities.set(id, element);
    }

    const x = powerup.x * GAME_CONFIG.CELL_SIZE;
    const y = powerup.y * GAME_CONFIG.CELL_SIZE;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  }
}

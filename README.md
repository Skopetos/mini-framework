# Bomberman DOM

A multiplayer Bomberman game built with a custom mini-framework, Socket.IO, and vanilla JavaScript.

## 🎮 Features

- **Multiplayer**: 2-4 players in real-time
- **Grid-based gameplay**: Classic Bomberman mechanics
- **Power-ups**: Bombs, Flames, Speed, 1 Up, Bomb Pass — plus periodic random spawns every 30 s
- **Death drops**: Players drop a powerup when they die
- **Real-time chat**: Communicate with other players
- **60 FPS rendering**: Smooth gameplay using requestAnimationFrame
- **Server-authoritative**: 30 TPS server tick rate

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Running the Game

```bash
npm start
```

Then open multiple browser windows/tabs to `http://localhost:3000`

### Development Mode (with auto-reload)

```bash
npm run dev
```

## 🎯 How to Play

### Controls
- **Movement**: Arrow keys or WASD
- **Place Bomb**: Space or Enter
- **Chat**: Type in the chat box and press Enter

### Gameplay
1. Enter your nickname and join the game
2. Wait for other players (minimum 2, maximum 4)
3. Game auto-starts after 20 seconds with 2+ players, or immediately with 4 players
4. If a player disconnects during the 10 s countdown and the count drops below 4, the countdown cancels and the 20 s lobby timer restarts
5. Destroy blocks to find power-ups
6. Eliminate other players with bomb explosions
7. Last player standing wins!
8. After the game ends you have 10 seconds to click **Return to Lobby** (keeps your nickname) or **Change Nickname** before the server auto-resets

### Power-ups
- 💣 **Bomb**: Increases bomb capacity by 1
- 🔥 **Flames**: Increases explosion range by 1
- ⚡ **Speed**: Increases movement speed (reduces per-cell move cooldown from 220 ms down to a minimum of 55 ms)
- ❤️ **1 Up**: Grants an extra life
- 🌀 **Bomb Pass**: Walk through bombs for 10 seconds; **stackable** — each pickup adds 10 s on top of any remaining time. A countdown badge is shown in the HUD next to your name (pulsing) and next to any other player who has it active.

> **Periodic spawns**: Every 30 seconds a random powerup drops on a random empty cell regardless of block destruction.

> **Death drops**: When a player dies they drop their last collected powerup at their position. If they had no powerups, a random one is dropped instead.

## 🎨 Custom Sprites (Optional)

The game works perfectly with CSS-based graphics (emojis and colors). However, if you want to add custom sprite images, place them in `client/assets/sprites/` with the following names:

### Player Sprites
- `player-red.png` - Player 1 (40x40px)
- `player-cyan.png` - Player 2 (40x40px)
- `player-yellow.png` - Player 3 (40x40px)
- `player-green.png` - Player 4 (40x40px)

### Map Tiles
- `tile-empty.png` - Empty grass tile (40x40px)
- `tile-wall.png` - Indestructible wall (40x40px)
- `tile-block.png` - Destructible block (40x40px)

### Game Objects
- `bomb.png` - Bomb sprite (40x40px)
- `explosion.png` - Explosion effect (40x40px)

### Power-ups
- `powerup-bomb.png` - Bomb power-up (40x40px)
- `powerup-flames.png` - Flame power-up (40x40px)
- `powerup-speed.png` - Speed power-up (40x40px)
- `powerup-oneup.png` - 1 Up power-up (40x40px)
- `powerup-bombpass.png` - Bomb Pass power-up (40x40px)

**Note**: All sprites should be 40x40 pixels to match the grid cell size. PNG format with transparency is recommended.

To enable sprite rendering, update the `game-loop.js` and add background-image styles instead of colors/emojis.

## 🏗️ Architecture

### Server (Node.js + Socket.IO)
- `server/server.js` - Main server and WebSocket handler
- `server/game-room.js` - Game state management and logic
- `server/map-generator.js` - Procedural map generation

### Client
- `client/app.js` - Main application entry point
- `client/components/` - UI components (Lobby, Game, GameOver)
- `client/systems/game-loop.js` - 60 FPS render loop and input handling
- `client/style.css` - All styling

### Shared
- `shared/constants.js` - Shared configuration between client and server

## 🔧 Configuration

Edit `shared/constants.js` to customize:
- Map size (default: 17x17)
- Tick rate (default: 30 TPS)
- Player lives (default: 3)
- Bomb timer (default: 3 seconds)
- Lobby timers
- And more...

## 📊 Performance

The game is optimized to run at:
- **Client**: 60 FPS rendering
- **Server**: 30 TPS game logic updates
- **Network**: State broadcasts at 30 Hz

Performance monitoring is built-in and will log warnings if FPS drops below 58.

## 🎯 Game Rules

1. **Starting Positions**: Players spawn in the four corners
2. **Lives**: Each player starts with 3 lives
3. **Bombs**: Players start with 1 bomb capacity and range 1
4. **Blocks**: 60% of empty spaces filled with destructible blocks
5. **Power-up drop on block destroy**: 30% chance to spawn a powerup
6. **Periodic power-up spawn**: 1 random powerup on a random empty cell every 30 seconds
7. **Death drop**: Dying player drops their last powerup (or a random one if they had none)
8. **Speed mechanic**: Speed powerup reduces the server-enforced move cooldown (220 ms → 165 → 110 → 55 ms min)
9. **Win Condition**: Last player with lives remaining wins

## 🛠️ Tech Stack

- **Server**: Node.js, Express, Socket.IO
- **Client**: Vanilla JavaScript (ES6 modules), Custom mini-framework
- **Rendering**: DOM manipulation with requestAnimationFrame
- **Networking**: WebSocket (Socket.IO)


# Bomberman Sprites

This folder is for optional sprite images. The game works perfectly without them using CSS-based graphics (emojis and colors).

## Sprite Files (All 40x40px PNG with transparency)

If you want to add custom sprites, place them here with these exact names:

### Players
- `player-red.png`
- `player-cyan.png`
- `player-yellow.png`
- `player-green.png`

### Tiles
- `tile-empty.png`
- `tile-wall.png`
- `tile-block.png`

### Objects
- `bomb.png`
- `explosion.png`

### Power-ups
- `powerup-bomb.png`
- `powerup-flames.png`
- `powerup-speed.png`

## Auto-Detection

The game will automatically detect and use sprites if they exist. If sprites are not found, it falls back to CSS-based rendering (emojis and colors).

Check the browser console when the game loads - it will show:
- `Sprite mode: ENABLED` - if sprites were loaded
- `Sprite mode: DISABLED (using CSS fallback)` - if using CSS graphics

## Creating Sprites

Recommended specifications:
- **Size**: 40x40 pixels exactly
- **Format**: PNG with transparency
- **Style**: Pixelart or any 2D style that fits Bomberman aesthetic
- **Colors**: Bright and distinct for gameplay clarity

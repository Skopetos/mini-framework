/**
 * Sprite Loader - Automatically loads sprite images if available
 * Falls back to CSS-based rendering (emojis/colors) if sprites don't exist
 */

class SpriteLoader {
  constructor() {
    this.sprites = new Map();
    this.loaded = false;
    this.useSprites = false;
  }

  async loadSprites() {
    const spritePaths = {
      // Players
      'player-red': '/assets/sprites/player-red.png',
      'player-cyan': '/assets/sprites/player-cyan.png',
      'player-yellow': '/assets/sprites/player-yellow.png',
      'player-green': '/assets/sprites/player-green.png',
      
      // Tiles
      'tile-empty': '/assets/sprites/tile-empty.png',
      'tile-wall': '/assets/sprites/tile-wall.png',
      'tile-block': '/assets/sprites/tile-block.png',
      
      // Objects
      'bomb': '/assets/sprites/bomb.png',
      'explosion': '/assets/sprites/explosion.png',
      
      // Power-ups
      'powerup-bomb': '/assets/sprites/powerup-bomb.png',
      'powerup-flames': '/assets/sprites/powerup-flames.png',
      'powerup-speed': '/assets/sprites/powerup-speed.png',
    };

    // Try to load sprites
    const loadPromises = Object.entries(spritePaths).map(([key, path]) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.sprites.set(key, path);
          resolve(true);
        };
        img.onerror = () => {
          resolve(false);
        };
        img.src = path;
      });
    });

    const results = await Promise.all(loadPromises);
    
    // If at least some sprites loaded, enable sprite mode
    this.useSprites = results.some(r => r);
    this.loaded = true;
    
    console.log(`Sprite mode: ${this.useSprites ? 'ENABLED' : 'DISABLED (using CSS fallback)'}`);
    
    return this.useSprites;
  }

  getSprite(key) {
    return this.sprites.get(key);
  }

  hasSprite(key) {
    return this.sprites.has(key);
  }
}

export const spriteLoader = new SpriteLoader();

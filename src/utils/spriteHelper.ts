import Phaser from 'phaser';

export type GameSprite = Phaser.GameObjects.Image | Phaser.GameObjects.Text;

/**
 * Try to load sprites. Silently skips missing files so emoji fallback works.
 * Call this in your scene's `preload()` method.
 */
export function preloadSprites(
  scene: Phaser.Scene,
  spriteMap: Record<string, string>,
): void {
  // Listen for load errors and silently skip missing sprite files
  scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
    // Remove the failed texture key so textures.exists() returns false later
    if (scene.textures.exists(file.key)) {
      scene.textures.remove(file.key);
    }
  });

  for (const [key, path] of Object.entries(spriteMap)) {
    scene.load.image(key, path);
  }
}

/**
 * Create an Image if the texture exists, otherwise fall back to emoji Text.
 */
export function createGameSprite(
  scene: Phaser.Scene,
  x: number,
  y: number,
  textureKey: string,
  fallbackEmoji: string,
  displayWidth: number,
  displayHeight: number,
  fontSize?: number,
): GameSprite {
  if (
    scene.textures.exists(textureKey) &&
    textureKey !== '__DEFAULT' &&
    textureKey !== '__MISSING'
  ) {
    const img = scene.add.image(x, y, textureKey);
    img.setDisplaySize(displayWidth, displayHeight);
    return img;
  }

  // Fallback: emoji text at appropriate size
  const size = fontSize || Math.round(displayWidth * 0.8);
  const txt = scene.add
    .text(x, y, fallbackEmoji, { fontSize: size + 'px' })
    .setOrigin(0.5);
  return txt;
}

/** Helper: set position on either Image or Text. */
export function setSpritePosition(
  sprite: GameSprite,
  x: number,
  y: number,
): void {
  sprite.setPosition(x, y);
}

/** Helper: set display size on either type. */
export function setSpriteSize(
  sprite: GameSprite,
  w: number,
  h: number,
): void {
  if (sprite instanceof Phaser.GameObjects.Image) {
    sprite.setDisplaySize(w, h);
  } else {
    sprite.setStyle({ fontSize: Math.round(w * 0.8) + 'px' });
  }
}

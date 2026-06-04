import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT = resolve(__dirname, '../public/logo.png');
const OUTPUT_DIR = resolve(__dirname, '../public/icons');
const SIZES = [48, 72, 96, 128, 144, 192, 384, 512];

async function generate() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const size of SIZES) {
    const output = resolve(OUTPUT_DIR, 'icon-' + size + 'x' + size + '.png');
    await sharp(INPUT)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(output);
    console.log('Generated: icon-' + size + 'x' + size + '.png');
  }

  console.log('All icons generated in public/icons/');
}

generate().catch(console.error);

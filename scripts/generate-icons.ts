import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const SIZES = [16, 32, 48, 96, 128] as const;
const SOURCE = 'logo.png';

async function main(): Promise<void> {
  await mkdir('public/icon', { recursive: true });

  // Optimized copy used by the popup header.
  await sharp(SOURCE).resize(256, 256).png({ compressionLevel: 9 }).toFile('public/logo.png');

  // Extension toolbar/store icons (keep the existing public/icon/<size>.png naming).
  await Promise.all(
    SIZES.map((size) =>
      sharp(SOURCE)
        .resize(size, size)
        .png({ compressionLevel: 9 })
        .toFile(`public/icon/${size}.png`),
    ),
  );

  console.log(`Generated public/logo.png and ${SIZES.length} icon sizes: ${SIZES.join(', ')}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

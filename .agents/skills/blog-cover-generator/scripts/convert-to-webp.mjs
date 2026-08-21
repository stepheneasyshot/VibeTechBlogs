#!/usr/bin/env node

import { mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const args = process.argv.slice(2);
const forceIndex = args.indexOf('--force');
const force = forceIndex !== -1;

if (force) args.splice(forceIndex, 1);

if (args.length !== 2) {
  console.error('Usage: convert-to-webp.mjs <input-image> <output.webp> [--force]');
  process.exit(2);
}

const [input, output] = args.map((value) => path.resolve(value));

if (path.extname(output).toLowerCase() !== '.webp') {
  console.error('Output filename must use the .webp extension.');
  process.exit(2);
}

try {
  await access(input);
} catch {
  console.error(`Input image does not exist: ${input}`);
  process.exit(2);
}

if (!force) {
  try {
    await access(output);
    console.error(`Output already exists: ${output}\nPass --force only for an explicitly authorized replacement.`);
    process.exit(3);
  } catch {
    // The output is available.
  }
}

await mkdir(path.dirname(output), { recursive: true });

await sharp(input)
  .rotate()
  .resize(860, 480, {
    fit: 'cover',
    position: 'centre',
  })
  .webp({
    quality: 88,
    effort: 6,
    smartSubsample: true,
  })
  .toFile(output);

const metadata = await sharp(output).metadata();

if (metadata.format !== 'webp' || metadata.width !== 860 || metadata.height !== 480) {
  console.error(`Conversion validation failed: ${metadata.format} ${metadata.width}x${metadata.height}`);
  process.exit(4);
}

console.log(`Created ${output} (${metadata.width}x${metadata.height}, ${metadata.format})`);

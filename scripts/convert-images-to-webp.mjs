// Batch convert PNG/JPG/JPEG in public/images/blog/ to WebP,
// rewrite references in src/content/blog/*.md, then delete originals.
// Skips: existing .webp, .gif (animation), .svg (vector).
//
// Usage: node scripts/convert-images-to-webp.mjs
//
// Re-runnable: if a .webp already exists alongside a .png with the same base
// name, the original is still converted (overwritten) for idempotency.

import { readdir, readFile, writeFile, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'public', 'images', 'blog');
const POST_DIR = path.join(ROOT, 'src', 'content', 'blog');

const CONVERTIBLE_EXT = new Set(['.png', '.jpg', '.jpeg']);
const QUALITY = 82;

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function main() {
  const files = await readdir(IMG_DIR);
  const targets = files.filter((f) => CONVERTIBLE_EXT.has(path.extname(f).toLowerCase()));

  if (targets.length === 0) {
    console.log('No PNG/JPG/JPEG files to convert.');
    return;
  }

  console.log(`Found ${targets.length} images to convert. Starting...\n`);

  let totalOriginal = 0;
  let totalWebp = 0;
  let converted = 0;
  let failed = 0;
  const failures = [];

  for (const file of targets) {
    const src = path.join(IMG_DIR, file);
    const dst = path.join(IMG_DIR, path.basename(file, path.extname(file)) + '.webp');

    try {
      const srcStat = await stat(src);
      await sharp(src, { failOn: 'none' })
        .rotate() // honor EXIF orientation
        .webp({ quality: QUALITY, effort: 4 })
        .toFile(dst);
      const dstStat = await stat(dst);
      totalOriginal += srcStat.size;
      totalWebp += dstStat.size;
      converted++;
      console.log(
        `  ✓ ${file} → ${path.basename(dst)}  ${formatBytes(srcStat.size)} → ${formatBytes(dstStat.size)}`
      );
    } catch (err) {
      failed++;
      failures.push({ file, error: String(err) });
      console.error(`  ✗ ${file} — ${err}`);
    }
  }

  console.log(`\nConversion done: ${converted} ok, ${failed} failed.`);
  if (converted > 0) {
    const saved = totalOriginal - totalWebp;
    const ratio = ((saved / totalOriginal) * 100).toFixed(1);
    console.log(
      `Total: ${formatBytes(totalOriginal)} → ${formatBytes(totalWebp)}  (saved ${formatBytes(saved)}, ${ratio}%)`
    );
  }

  // Rewrite references in markdown files.
  console.log('\nRewriting references in markdown...');
  const mdFiles = (await readdir(POST_DIR)).filter((f) => f.endsWith('.md'));
  let totalReplacements = 0;
  let touchedFiles = 0;

  for (const md of mdFiles) {
    const mdPath = path.join(POST_DIR, md);
    const original = await readFile(mdPath, 'utf8');
    // Match /images/blog/<name>.<ext> where ext is png/jpg/jpeg.
    // Use a regex that captures the path up to the extension and replaces ext with .webp.
    // We must be careful to only match within /images/blog/ paths to avoid touching unrelated .png mentions.
    const regex = /\/images\/blog\/([^\s"')]+\.(?:png|jpe?g))(?=["')]|$)/gi;
    let count = 0;
    const updated = original.replace(regex, (match, p1) => {
      count++;
      const base = p1.replace(/\.(?:png|jpe?g)$/i, '');
      return `/images/blog/${base}.webp`;
    });
    if (count > 0) {
      await writeFile(mdPath, updated, 'utf8');
      totalReplacements += count;
      touchedFiles++;
    }
  }
  console.log(`Rewrote ${totalReplacements} references across ${touchedFiles} markdown files.`);

  // Delete originals only after all rewrites are done.
  console.log('\nDeleting original PNG/JPG/JPEG files...');
  let deleted = 0;
  for (const file of targets) {
    const src = path.join(IMG_DIR, file);
    // Only delete if a .webp counterpart exists.
    const dst = path.join(IMG_DIR, path.basename(file, path.extname(file)) + '.webp');
    if (existsSync(dst)) {
      await rm(src);
      deleted++;
    }
  }
  console.log(`Deleted ${deleted} original files.`);

  if (failures.length) {
    console.log('\nFailures:');
    for (const f of failures) console.log(`  ${f.file}: ${f.error}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

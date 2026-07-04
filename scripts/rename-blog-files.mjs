#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = new URL('../src/content/blog', import.meta.url).pathname;

function newFilename(oldName) {
  return oldName.replace(/【[^】]+】/g, '');
}

function stripBrackets(text) {
  return text.replace(/【[^】]+】/g, '');
}

// 1. Build rename map
const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
const renameMap = new Map();
const targetNames = new Map();

for (const file of files) {
  const target = newFilename(file);
  if (target === file) continue;

  if (targetNames.has(target)) {
    console.error(`Collision: "${file}" and "${targetNames.get(target)}" → "${target}"`);
    process.exit(1);
  }

  targetNames.set(target, file);
  renameMap.set(file, target);
}

console.log(`Planned renames: ${renameMap.size}`);

// 2. Update markdown links in all blog files (before rename, map old→new)
const linkUpdates = new Map();
for (const [oldName, newName] of renameMap) {
  linkUpdates.set(oldName, newName);
  linkUpdates.set(encodeURI(oldName), encodeURI(newName));
}

function updateLinks(content) {
  let next = content;
  for (const [oldRef, newRef] of linkUpdates) {
    next = next.split(oldRef).join(newRef);
  }
  // 兜底：链接里残留的 【...】 前缀
  next = next.replace(
    /(\[[^\]]*\]\([^)]*?\/)((?:\d{4}-\d{1,2}-\d{1,2}-)?【[^】]+】)/g,
    (_, prefix) => prefix,
  );
  next = next.replace(/(\[[^\]]*\]\([^)]*?\/)【[^】]+】/g, '$1');
  next = next.replace(/(\.\/|\(\/blog\/)(\d{4}-\d{1,2}-\d{1,2}-)【[^】]+】/g, '$1$2');
  return next;
}

for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = updateLinks(original);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
  }
}

// 3. Rename files
for (const [oldName, newName] of renameMap) {
  fs.renameSync(path.join(BLOG_DIR, oldName), path.join(BLOG_DIR, newName));
  console.log(`  ${oldName} → ${newName}`);
}

// 4. Check duplicate content files (same date, similar title without brackets)
const afterFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
const byBase = new Map();
for (const f of afterFiles) {
  const base = f.replace(/\.md$/, '');
  if (!byBase.has(base)) byBase.set(base, []);
  byBase.get(base).push(f);
}

const dupes = [...byBase.entries()].filter(([, list]) => list.length > 1);
if (dupes.length) {
  console.warn('\nRemaining duplicate slugs after rename:');
  for (const [base, list] of dupes) {
    console.warn(`  ${base}: ${list.join(', ')}`);
  }
}

console.log('\nDone.');

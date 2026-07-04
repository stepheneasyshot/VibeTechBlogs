#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = new URL('../src/content/blog', import.meta.url).pathname;
const IMAGE_DIR = new URL('../public/images/blog', import.meta.url).pathname;

const imageFiles = new Set(fs.readdirSync(IMAGE_DIR));

function migrateContent(text) {
  // 1. 统一路径前缀
  text = text.replaceAll('/assets/img/blog/', '/images/blog/');

  // 2. Jekyll 嵌套 image frontmatter → Astro 字符串
  text = text.replace(
    /^image:\s*\n\s*path:\s*(\/images\/blog\/[^\s]+)\s*\n(?:[ \t]+(?:srcset:|1920w:|960w:|480w:).*$\n?)+/gm,
    'image: "$1"\n',
  );

  // 3. 移除 accent_image
  text = text.replace(/^accent_image:.*\n/gm, '');

  // 4. 规范化已有单行 image（补引号）
  text = text.replace(
    /^image:\s*(\/images\/blog\/[^\s"']+)\s*$/gm,
    'image: "$1"',
  );

  // 5. Jekyll Kramdown 图片属性 → HTML img
  text = text.replace(
    /!\[([^\]]*)\]\(([^)]+)\)\{([^}]+)\}/g,
    (_match, alt, src, rawAttrs) => {
      const attrs = rawAttrs
        .replace(/:(\w+)\s*=/g, '$1=')
        .replace(/\s+/g, ' ')
        .trim();
      const altAttr = alt ? ` alt="${alt}"` : '';
      return `<img src="${src}"${altAttr} ${attrs} />`;
    },
  );

  return text;
}

function collectImageRefs(text) {
  const refs = [];
  const re = /\/images\/blog\/([^\s"'`)]+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    refs.push(m[1]);
  }
  return refs;
}

const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
let updated = 0;
const missing = new Map();

for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  const original = fs.readFileSync(filePath, 'utf8');
  const migrated = migrateContent(original);

  if (migrated !== original) {
    fs.writeFileSync(filePath, migrated, 'utf8');
    updated++;
  }

  for (const ref of collectImageRefs(migrated)) {
    if (!imageFiles.has(ref)) {
      if (!missing.has(ref)) missing.set(ref, []);
      missing.get(ref).push(file);
    }
  }
}

console.log(`Processed ${files.length} files, updated ${updated}.`);

if (missing.size > 0) {
  console.log(`\nMissing ${missing.size} image file(s):`);
  for (const [name, posts] of [...missing.entries()].sort()) {
    console.log(`  ${name} (referenced in ${posts.length} post(s))`);
  }
} else {
  console.log('All referenced images exist in public/images/blog/.');
}

#!/usr/bin/env node
/**
 * 验证各页面是否正确配置了 data-page-kind 与 View Transition 动画名。
 * 用法：node scripts/verify-transitions.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');

const EXPECTED = {
  'index.html': 'list',
  'blog/index.html': 'list',
  'about/index.html': 'static',
  'category/cpp/index.html': 'category',
};

const ANIMATION_NAMES = [
  'page-fade-in',
  'page-list-out',
  'page-list-return',
  'page-post-in',
  'page-post-exit',
  'page-category-in',
  'page-category-out',
  'page-slide-in-right',
  'page-slide-in-left',
  'theme-circle-expand',
];

function walkHtml(dir, base = '') {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const rel = base ? `${base}/${entry}` : entry;
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) {
      files.push(...walkHtml(abs, rel));
    } else if (entry === 'index.html') {
      files.push(rel);
    }
  }
  return files;
}

function extractPageKind(html) {
  const match = html.match(/data-page-kind="(list|post|category|static)"/);
  return match?.[1] ?? null;
}

function extractTransitionNames(html) {
  const names = new Set();
  const re = /"name":"(page-[^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) names.add(m[1]);
  return names;
}

let failed = false;

console.log('=== Route transition verification ===\n');

for (const [rel, kind] of Object.entries(EXPECTED)) {
  const abs = join(DIST, rel);
  let html;
  try {
    html = readFileSync(abs, 'utf8');
  } catch {
    console.error(`✗ Missing ${rel}`);
    failed = true;
    continue;
  }
  const found = extractPageKind(html);
  if (found === kind) {
    console.log(`✓ ${rel} → data-page-kind="${kind}"`);
  } else {
    console.error(`✗ ${rel} expected "${kind}", got "${found}"`);
    failed = true;
  }
}

const postHtml = readFileSync(join(DIST, 'blog/2026-7-1-vibecoding最佳姿势/index.html'), 'utf8');
const postKind = extractPageKind(postHtml);
if (postKind === 'post') {
  console.log('✓ blog/[slug] → data-page-kind="post"');
} else {
  console.error(`✗ blog/[slug] expected "post", got "${postKind}"`);
  failed = true;
}

const css = readFileSync(join(DIST, '_astro', readdirSync(join(DIST, '_astro')).find((f) => f.endsWith('.css'))), 'utf8');
for (const name of ANIMATION_NAMES) {
  if (css.includes(`@keyframes ${name}`)) {
    console.log(`✓ @keyframes ${name} in CSS bundle`);
  } else {
    console.error(`✗ Missing @keyframes ${name}`);
    failed = true;
  }
}

const samplePages = walkHtml(DIST).slice(0, 5);
const transitionInjected = samplePages.every((rel) => {
  const html = readFileSync(join(DIST, rel), 'utf8');
  return html.includes('transition:persist') || html.includes('astro-view-transitions-enabled');
});

if (transitionInjected) {
  console.log('✓ View Transitions enabled in sample pages');
} else {
  console.error('✗ View Transitions not detected');
  failed = true;
}

console.log(`\n${failed ? 'FAILED' : 'PASSED'} — ${walkHtml(DIST).length} HTML pages scanned`);
process.exit(failed ? 1 : 0);

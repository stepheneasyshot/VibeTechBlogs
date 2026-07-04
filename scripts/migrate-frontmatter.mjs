#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = new URL('../src/content/blog', import.meta.url).pathname;

/** 合并 Android 生态相关标签，便于侧栏分类 */
const CATEGORY_MAP = {
  Android基础: 'Android',
  Android进阶: 'Android',
  Android性能优化: 'Android',
  AOSP: 'Android',
  Compose: 'Android',
  Kotlin: 'Android',
};

function parseFilename(filename) {
  const base = filename.replace(/\.md$/, '');
  const dateMatch = base.match(/^(\d{4})-(\d{1,2})-(\d{1,2})-/);
  if (!dateMatch) return null;

  const pubDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;

  const catMatch = base.match(/【([^】]+)】/);
  let category = catMatch?.[1] ?? null;
  if (category && CATEGORY_MAP[category]) {
    category = CATEGORY_MAP[category];
  }

  if (!category) {
    const lower = base.toLowerCase();
    if (/android|compose|kotlin|aosp|aidl/.test(lower)) category = 'Android';
    else if (/llm|vibe|ai|rag|claude|openclaw|qwen|agent|deepseek|doubao/.test(lower)) category = 'AI';
    else if (/算法|algorithm|leetcode/.test(lower)) category = '算法';
    else if (/c\+\+|cpp/.test(lower)) category = 'C++';
    else if (/python/.test(lower)) category = 'Python';
    else if (/跨平台|kmp|flutter|harmony|compose multiplatform/.test(lower)) category = '跨平台';
    else if (/网络|http|mqtt|okhttp|retrofit|websocket/.test(lower)) category = '网络';
    else category = '通用开发';
  }

  return { pubDate, category };
}

function extractH1(body) {
  const match = body.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? null;
}

function yamlQuote(value) {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function extractDescription(fm, body, title) {
  const blockMatch = fm.match(/^description:\s*>\s*\n((?:[ \t].*\n?)+)/m);
  if (blockMatch) {
    return { type: 'block', value: blockMatch[1].replace(/\n$/, '') };
  }

  const quotedMatch = fm.match(/^description:\s*"([^"]*)"/m);
  if (quotedMatch) {
    return { type: 'inline', value: quotedMatch[1] };
  }

  const plainMatch = fm.match(/^description:\s*(.+)$/m);
  if (plainMatch) {
    return { type: 'inline', value: plainMatch[1].trim() };
  }

  const para = body
    .replace(/^#\s+.+\n+/, '')
    .split(/\n\n+/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .find((p) => p && !p.startsWith('#') && !p.startsWith('```') && !p.startsWith('![') && !p.startsWith('<img'));

  return { type: 'inline', value: para?.slice(0, 160) ?? title ?? '暂无摘要' };
}

function buildFrontmatter({ title, description, pubDate, category, image, draft }) {
  const lines = [`title: ${yamlQuote(title)}`];

  if (description.type === 'block') {
    lines.push('description: >');
    for (const line of description.value.split('\n')) {
      lines.push(line.startsWith('  ') ? line : `  ${line}`);
    }
  } else {
    lines.push(`description: ${yamlQuote(description.value)}`);
  }

  lines.push(`pubDate: ${pubDate}`);
  lines.push(`category: ${yamlQuote(category)}`);
  lines.push(`featured: false`);
  lines.push(`draft: ${draft ? 'true' : 'false'}`);

  if (image) {
    lines.push(`image: ${yamlQuote(image)}`);
  }

  return lines.join('\n');
}

function migrateFile(filename) {
  const filePath = path.join(BLOG_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  const isTodoList = filename === '待完善文章列表.md';

  if (isTodoList) {
    const body = content.trimStart();
    const fm = buildFrontmatter({
      title: '待完善文章列表',
      description: { type: 'inline', value: '内部备忘：待完善与待更新的文章索引。' },
      pubDate: '2026-01-01',
      category: '通用开发',
      image: null,
      draft: true,
    });
    const next = `---\n${fm}\n---\n\n${body}\n`;
    if (next !== content) fs.writeFileSync(filePath, next, 'utf8');
    return 'todo';
  }

  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return 'skip';

  const [, oldFm, body] = match;
  const meta = parseFilename(filename);
  if (!meta) return 'skip';

  const existingTitle = oldFm.match(/^title:\s*"([^"]*)"/m)?.[1];
  const title = existingTitle ?? extractH1(body) ?? filename.replace(/\.md$/, '');

  const description = extractDescription(oldFm, body, title);
  const image = oldFm.match(/^image:\s*"([^"]+)"/m)?.[1] ?? null;
  const draft = /^draft:\s*true/m.test(oldFm);

  const newFm = buildFrontmatter({
    title,
    description,
    pubDate: oldFm.match(/^pubDate:\s*(.+)$/m)?.[1]?.trim() ?? meta.pubDate,
    category: oldFm.match(/^category:\s*"([^"]+)"/m)?.[1] ?? meta.category,
    image,
    draft,
  });

  const next = `---\n${newFm}\n---\n${body}`;
  if (next !== content) {
    fs.writeFileSync(filePath, next, 'utf8');
    return 'updated';
  }
  return 'unchanged';
}

const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
const stats = { updated: 0, todo: 0, unchanged: 0, skip: 0 };

for (const file of files) {
  const result = migrateFile(file);
  stats[result === 'updated' ? 'updated' : result]++;
}

console.log(`Frontmatter migration: ${stats.updated} updated, ${stats.todo} todo list, ${stats.unchanged} unchanged, ${stats.skip} skipped.`);

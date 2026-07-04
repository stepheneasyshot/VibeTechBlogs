#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = new URL('../src/content/blog', import.meta.url).pathname;

const VALID_TABS = new Set([
  'Android',
  'AI',
  '跨平台',
  '网络',
  '通用开发',
  '算法',
  'C++',
  'Python',
]);

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  return { fm: match[1], body: match[2] };
}

function parseCategories(fm) {
  const arrayMatch = fm.match(/^category:\s*\[(.*)\]/m);
  if (arrayMatch) {
    return [...arrayMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  }

  const quoted = fm.match(/^category:\s*"([^"]+)"/m);
  if (quoted) return [quoted[1]];

  return [];
}

function inferExtraCategories(primary, filename, title, description, body) {
  const text = `${filename}\n${title}\n${description}\n${body.slice(0, 1500)}`;
  const extras = new Set();
  const has = (re) => re.test(text);

  if (primary === '跨平台') extras.add('Android');

  if (primary === 'AI') {
    if (has(/Python|\.py\b|pip install/i)) extras.add('Python');
    if (has(/端侧|LiteRT|llama\.cpp|doubao|移动(端)?应用|Android/i)) extras.add('Android');
    if (has(/跨平台|Multiplatform|KMP|Flutter|HarmonyOS|鸿蒙/i)) extras.add('跨平台');
  }

  if (primary === 'Android') {
    if (has(/跨平台|Multiplatform|KMP|Flutter|HarmonyOS|鸿蒙|Compose Desktop|Unity/i)) extras.add('跨平台');
    if (has(/\bJNI\b|NDK|native/i)) extras.add('C++');
    if (has(/OkHttp|Retrofit|MQTT|WebSocket|HTTPS/i)) extras.add('网络');
  }

  if (primary === '网络' && has(/OkHttp|Retrofit|Android/i)) extras.add('Android');
  if (primary === '算法' && has(/C\+\+|\bcpp\b|STL|容器/i)) extras.add('C++');
  if (primary === 'C++' && has(/算法|LeetCode|leetcode|双指针|滑动窗口|链表|数据结构/i)) extras.add('算法');
  if (primary === 'Python' && has(/\bAI\b|LLM|Deepseek|模型|RAG/i)) extras.add('AI');

  if (primary === '通用开发') {
    if (has(/Kotlin|Android|Compose|协程|JVM.*Android|DVM|ART/i)) extras.add('Android');
    if (has(/跨平台|Multiplatform|KMP/i)) extras.add('跨平台');
  }

  extras.delete(primary);
  return [...VALID_TABS].filter((tab) => extras.has(tab));
}

function formatCategoryYaml(categories) {
  if (categories.length === 1) return `category: "${categories[0]}"`;
  return `category: [${categories.map((c) => `"${c}"`).join(', ')}]`;
}

function rebuildFrontmatter(fm, categories) {
  const lines = fm.split('\n').filter((line) => !line.startsWith('tags:'));
  const categoryIndex = lines.findIndex((line) => line.startsWith('category:'));
  if (categoryIndex === -1) return fm;

  lines[categoryIndex] = formatCategoryYaml(categories);
  return lines.join('\n');
}

const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
let updated = 0;
let multi = 0;

for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = parseFrontmatter(content);
  if (!parsed) continue;

  const existing = parseCategories(parsed.fm);
  if (existing.length === 0) continue;

  const primary = existing[0];
  const title = parsed.fm.match(/^title:\s*"([^"]*)"/m)?.[1] ?? '';
  const description = parsed.fm.match(/^description:\s*>\s*\n([\s\S]*?)(?=\n[a-z_]+:|\n---)/m)?.[1]
    ?? parsed.fm.match(/^description:\s*"([^"]*)"/m)?.[1]
    ?? '';

  const extras = inferExtraCategories(primary, file, title, description, parsed.body);
  const categories = [...new Set([primary, ...extras])];
  const newFm = rebuildFrontmatter(parsed.fm, categories);
  const next = `---\n${newFm}\n---\n${parsed.body}`;

  if (next !== content) {
    fs.writeFileSync(filePath, next, 'utf8');
    updated++;
  }

  if (categories.length > 1) multi++;
}

console.log(`Updated ${updated} files, ${multi} with multiple categories.`);

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = new URL('../src/content/blog', import.meta.url).pathname;

function stripLeadingBracketTag(text) {
  return text.replace(/^【[^】]+】\s*/, '');
}

function processFile(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return content;

  let [, fm, body] = match;

  fm = fm.replace(/^title:\s*"([^"]*)"/m, (_, title) => {
    return `title: "${stripLeadingBracketTag(title)}"`;
  });

  body = body.replace(/^#\s+(.+)$/m, (_, heading) => {
    return `# ${stripLeadingBracketTag(heading)}`;
  });

  return `---\n${fm}\n---\n${body}`;
}

const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
let updated = 0;

for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  const original = fs.readFileSync(filePath, 'utf8');
  const next = processFile(original);
  if (next !== original) {
    fs.writeFileSync(filePath, next, 'utf8');
    updated++;
  }
}

console.log(`Stripped bracket prefixes from title/H1 in ${updated} files.`);

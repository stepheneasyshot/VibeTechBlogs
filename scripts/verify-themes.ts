/**
 * Verifies theme registry + generated brand CSS.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND_ROLES, COLOR_ROLES } from '../src/styles/themes/roles.ts';
import { themes } from '../src/styles/themes/index.ts';
import type { ColorScheme } from '../src/styles/themes/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const generatedPath = join(__dirname, '../src/styles/generated/themes.css');

let failed = false;

function fail(message: string) {
  console.error(`[verify-themes] ${message}`);
  failed = true;
}

function assertScheme(id: string, mode: 'light' | 'dark', scheme: ColorScheme) {
  for (const role of COLOR_ROLES) {
    const value = scheme[role];
    if (typeof value !== 'string' || !value.trim()) {
      fail(`Theme "${id}" ${mode} missing or empty role: ${role}`);
    }
  }
}

if (themes.length === 0) {
  fail('No themes registered in src/styles/themes/index.ts');
}

for (const theme of themes) {
  if (!theme.id || !/^[a-z0-9-]+$/.test(theme.id)) {
    fail(`Invalid theme id: ${JSON.stringify(theme.id)}`);
  }
  assertScheme(theme.id, 'light', theme.light);
  assertScheme(theme.id, 'dark', theme.dark);
}

let css = '';
try {
  css = readFileSync(generatedPath, 'utf8');
} catch {
  fail(`Missing generated file: ${generatedPath} — run npm run generate:themes`);
}

if (css) {
  if (css.includes('.dark')) {
    fail('generated/themes.css must not contain .dark blocks (neutrals belong in global.css)');
  }
  for (const theme of themes) {
    if (!css.includes(`html[data-theme="${theme.id}"]`)) {
      fail(`generated/themes.css missing selector for "${theme.id}"`);
    }
    for (const role of BRAND_ROLES) {
      const block = css.match(
        new RegExp(`html\\[data-theme="${theme.id}"\\] \\{([\\s\\S]*?)\\n\\}`),
      );
      if (block && !block[1].includes(`--color-${role}:`)) {
        fail(`generated CSS for "${theme.id}" missing --color-${role}`);
      }
    }
    for (const role of ['background', 'on-background', 'surface'] as const) {
      const block = css.match(
        new RegExp(`html\\[data-theme="${theme.id}"\\] \\{([\\s\\S]*?)\\n\\}`),
      );
      if (block && block[1].includes(`--color-${role}:`)) {
        fail(`generated CSS for "${theme.id}" must not set neutral --color-${role}`);
      }
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `[verify-themes] OK — ${themes.length} theme(s), ${BRAND_ROLES.length} brand roles (neutrals via light/dark)`,
);

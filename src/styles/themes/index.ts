import { defaultTheme } from './default.ts';
import {
  blossomTheme,
  emberTheme,
  forestTheme,
  indigoTheme,
  oceanTheme,
  sandTheme,
  violetTheme,
} from './palettes.ts';
import type { ThemeDefinition } from './types.ts';

/**
 * Palette registry. Add a new theme by:
 * 1. Define via buildTheme() in palettes.ts (or a dedicated file)
 * 2. Import and append it here
 * 3. Run `npm run generate:themes` (also runs on dev/build)
 */
export const themes: ThemeDefinition[] = [
  forestTheme,
  defaultTheme,
  oceanTheme,
  blossomTheme,
  violetTheme,
  emberTheme,
  indigoTheme,
  sandTheme,
];

/** Site default palette (FOUC / first visit). */
export const SITE_BASE_THEME_ID = forestTheme.id;

/**
 * All color schemes in the picker grid.
 * Light/dark mode is independent and does not change the selected palette.
 */
export const colorThemes = themes;

/** Compact meta for client-side picker. */
export const themePickerMeta = {
  baseId: SITE_BASE_THEME_ID,
  /** Neutral swatches for 浅色 / 深色 row (not brand-tinted). */
  modeLightSwatch: '#f7f9fb',
  modeDarkSwatch: '#191c1e',
  colors: colorThemes.map((t) => ({
    id: t.id,
    label: t.label,
    swatch: t.swatch,
    accent: t.accent,
  })),
};

export { COLOR_ROLES, BRAND_ROLES, NEUTRAL_ROLES } from './roles.ts';
export type { ColorRole, BrandRole, NeutralRole } from './roles.ts';
export type { ColorScheme, ThemeDefinition } from './types.ts';

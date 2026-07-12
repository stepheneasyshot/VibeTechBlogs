import type { ColorRole } from './roles.ts';

/** Full MD3 color scheme — every ColorRole must be present. */
export type ColorScheme = Record<ColorRole, string>;

export interface ThemeDefinition {
  /** DOM `data-theme` value and localStorage `palette` key */
  id: string;
  /** Human-readable label for palette picker */
  label: string;
  /** Primary swatch color shown in the picker grid */
  swatch: string;
  /** Accent chip color for dual-tone preview */
  accent: string;
  light: ColorScheme;
  dark: ColorScheme;
}

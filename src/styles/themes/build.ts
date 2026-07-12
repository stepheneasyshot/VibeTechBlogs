import type { ColorScheme, ThemeDefinition } from './types.ts';

/** Error roles shared by all palettes. */
const LIGHT_ERROR = {
  error: '#ba1a1a',
  'on-error': '#ffffff',
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',
} as const;

const DARK_ERROR = {
  error: '#ffb4ab',
  'on-error': '#690005',
  'error-container': '#93000a',
  'on-error-container': '#ffdad6',
} as const;

/** Default cool-gray surfaces (also used by default theme). */
export const DEFAULT_LIGHT_SURFACES = {
  background: '#f7f9fb',
  'on-background': '#191c1e',
  surface: '#f7f9fb',
  'on-surface': '#191c1e',
  'surface-variant': '#e0e3e5',
  'on-surface-variant': '#45464d',
  'surface-dim': '#d8dadc',
  'surface-bright': '#f7f9fb',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#f2f4f6',
  'surface-container': '#eceef0',
  'surface-container-high': '#e6e8ea',
  'surface-container-highest': '#e0e3e5',
  outline: '#76777d',
  'outline-variant': '#c6c6cd',
  'inverse-surface': '#2d3133',
  'inverse-on-surface': '#eff1f3',
} as const;

export const DEFAULT_DARK_SURFACES = {
  background: '#191c1e',
  'on-background': '#eff1f3',
  surface: '#191c1e',
  'on-surface': '#eff1f3',
  'surface-variant': '#45464d',
  'on-surface-variant': '#c6c6cd',
  'surface-dim': '#191c1e',
  'surface-bright': '#373b3d',
  'surface-container-lowest': '#0d0f10',
  'surface-container-low': '#1d2022',
  'surface-container': '#212426',
  'surface-container-high': '#2b2f31',
  'surface-container-highest': '#363a3c',
  outline: '#90909a',
  'outline-variant': '#45464d',
  'inverse-surface': '#eff1f3',
  'inverse-on-surface': '#2d3133',
} as const;

export type SurfaceScheme = typeof DEFAULT_LIGHT_SURFACES;

/** Brand roles that differ per palette (excludes surfaces + error). */
export type BrandScheme = Omit<
  ColorScheme,
  keyof SurfaceScheme | keyof typeof LIGHT_ERROR
>;

export function buildTheme(opts: {
  id: string;
  label: string;
  swatch: string;
  accent: string;
  /** Tinted page/surface neutrals — main background follows these. */
  surfaces: { light: SurfaceScheme; dark: SurfaceScheme };
  light: BrandScheme;
  dark: BrandScheme;
}): ThemeDefinition {
  return {
    id: opts.id,
    label: opts.label,
    swatch: opts.swatch,
    accent: opts.accent,
    light: { ...LIGHT_ERROR, ...opts.surfaces.light, ...opts.light },
    dark: { ...DARK_ERROR, ...opts.surfaces.dark, ...opts.dark },
  };
}

/** Helper: build a light surface ramp from a tinted background hex family. */
export function lightSurfaces(bg: string, pack: {
  surface?: string;
  dim?: string;
  bright?: string;
  lowest?: string;
  low?: string;
  container?: string;
  high?: string;
  highest?: string;
  variant?: string;
  onVariant?: string;
  outline?: string;
  outlineVariant?: string;
}): SurfaceScheme {
  return {
    background: bg,
    'on-background': '#191c1e',
    surface: pack.surface ?? bg,
    'on-surface': '#191c1e',
    'surface-variant': pack.variant ?? '#e0e3e5',
    'on-surface-variant': pack.onVariant ?? '#45464d',
    'surface-dim': pack.dim ?? '#d8dadc',
    'surface-bright': pack.bright ?? bg,
    'surface-container-lowest': pack.lowest ?? '#ffffff',
    'surface-container-low': pack.low ?? '#f2f4f6',
    'surface-container': pack.container ?? '#eceef0',
    'surface-container-high': pack.high ?? '#e6e8ea',
    'surface-container-highest': pack.highest ?? '#e0e3e5',
    outline: pack.outline ?? '#76777d',
    'outline-variant': pack.outlineVariant ?? '#c6c6cd',
    'inverse-surface': '#2d3133',
    'inverse-on-surface': '#eff1f3',
  };
}

export function darkSurfaces(bg: string, pack: {
  surface?: string;
  dim?: string;
  bright?: string;
  lowest?: string;
  low?: string;
  container?: string;
  high?: string;
  highest?: string;
  variant?: string;
  onVariant?: string;
  outline?: string;
  outlineVariant?: string;
}): SurfaceScheme {
  return {
    background: bg,
    'on-background': '#eff1f3',
    surface: pack.surface ?? bg,
    'on-surface': '#eff1f3',
    'surface-variant': pack.variant ?? '#45464d',
    'on-surface-variant': pack.onVariant ?? '#c6c6cd',
    'surface-dim': pack.dim ?? bg,
    'surface-bright': pack.bright ?? '#373b3d',
    'surface-container-lowest': pack.lowest ?? '#0d0f10',
    'surface-container-low': pack.low ?? '#1d2022',
    'surface-container': pack.container ?? '#212426',
    'surface-container-high': pack.high ?? '#2b2f31',
    'surface-container-highest': pack.highest ?? '#363a3c',
    outline: pack.outline ?? '#90909a',
    'outline-variant': pack.outlineVariant ?? '#45464d',
    'inverse-surface': '#eff1f3',
    'inverse-on-surface': '#2d3133',
  };
}

/**
 * MD3 color role contract.
 * Brand roles → per palette (data-theme). Neutral roles → light/dark mode only.
 */

/** Brand / accent roles — fixed per color scheme, unchanged by 浅色/深色. */
export const BRAND_ROLES = [
  'primary',
  'on-primary',
  'primary-container',
  'on-primary-container',
  'primary-fixed',
  'primary-fixed-dim',
  'on-primary-fixed',
  'on-primary-fixed-variant',
  'inverse-primary',
  'secondary',
  'on-secondary',
  'secondary-container',
  'on-secondary-container',
  'secondary-fixed',
  'secondary-fixed-dim',
  'on-secondary-fixed',
  'on-secondary-fixed-variant',
  'tertiary',
  'on-tertiary',
  'tertiary-container',
  'on-tertiary-container',
  'tertiary-fixed',
  'tertiary-fixed-dim',
  'on-tertiary-fixed',
  'on-tertiary-fixed-variant',
  'surface-tint',
] as const;

/** Surface / text / error — switched only by light/dark mode. */
export const NEUTRAL_ROLES = [
  'error',
  'on-error',
  'error-container',
  'on-error-container',
  'background',
  'on-background',
  'surface',
  'on-surface',
  'surface-variant',
  'on-surface-variant',
  'surface-dim',
  'surface-bright',
  'surface-container-lowest',
  'surface-container-low',
  'surface-container',
  'surface-container-high',
  'surface-container-highest',
  'outline',
  'outline-variant',
  'inverse-surface',
  'inverse-on-surface',
] as const;

export const COLOR_ROLES = [...BRAND_ROLES, ...NEUTRAL_ROLES] as const;

export type BrandRole = (typeof BRAND_ROLES)[number];
export type NeutralRole = (typeof NEUTRAL_ROLES)[number];
export type ColorRole = (typeof COLOR_ROLES)[number];

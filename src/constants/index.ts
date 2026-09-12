/**
 * Design tokens — the single source of truth for the app's visual identity.
 *
 * Every color, radius, spacing step and text style the screens render comes
 * from here. If a value is not in this file, it should not appear in a
 * StyleSheet: that is what kept the palette drifting into seven near-identical
 * grays and two different greens for "success".
 */

export const COLORS = {
  /* Brand */
  primary: '#003087', // Ford Blue
  primaryBright: '#0a4bb8', // hero accents on a Ford Blue ground
  primaryTint: '#f0f5ff', // informational card backgrounds
  primaryTintStrong: '#e8efff', // selected / active chip backgrounds
  primaryBorder: '#c5d4f0', // outline on tinted surfaces
  secondary: '#1a73e8',

  /* Status */
  success: '#1e8e3e',
  successTint: '#e9f7ee',
  warning: '#f5a623',
  warningStrong: '#ffc966', // progress fills and medals on dark grounds
  warningTint: '#fff4e0',
  warningText: '#a36b00', // readable amber on warningTint
  danger: '#ea4335',
  dangerTint: '#fce8e6',
  dangerText: '#c62828', // readable red on dangerTint

  /* Neutrals */
  white: '#fff',
  background: '#f5f5f7', // app canvas
  surface: '#fff', // cards
  surfaceAlt: '#eef0f3', // inset rows, progress tracks
  surfaceMuted: '#f0f2f5', // disabled inputs, secondary chips
  border: '#e6e8eb',
  borderStrong: '#c5cdd9', // disabled CTA background
  dark: '#202124', // primary text
  gray: '#80868b', // secondary text
  shadow: '#000',

  /** @deprecated Use `surfaceMuted`. Kept so older imports keep compiling. */
  light: '#f8f9fa',
} as const;

/**
 * Categorical palette — avatars, reward categories and timeline event types.
 * Intentionally separate from COLORS: these carry no status meaning, they only
 * need to be distinguishable from each other.
 */
export const ACCENTS = {
  violet: '#5e35b1',
  purple: '#9c27b0',
  purpleDark: '#8e24aa',
  pink: '#e91e63',
  coral: '#ff7043',
  teal: '#00897b',
} as const;

export const ACCENT_TINTS = {
  purple: '#f3e5f5',
  pink: '#fce4ec',
  coral: '#fdf0e6',
} as const;

/* ─────────────────────────────────────────────
 * Layout
 * ───────────────────────────────────────────── */

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 20,
  hero: 28,
  pill: 999,
} as const;

/** Card elevations. Spread into a StyleSheet entry. */
export const SHADOWS = {
  card: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  raised: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

/**
 * Type scale. `weight` values are the RN string literals, so spreading these
 * into a StyleSheet keeps TypeScript happy without a cast.
 */
export const TYPOGRAPHY = {
  heroTitle: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '800' as const },
  sectionTitle: { fontSize: 16, fontWeight: '800' as const },
  body: { fontSize: 14, fontWeight: '500' as const },
  label: {
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  caption: { fontSize: 12, fontWeight: '600' as const },
} as const;

/* ─────────────────────────────────────────────
 * Domain constants
 * ───────────────────────────────────────────── */

export const SEGMENTS = {
  loyal: {
    name: 'Fiel',
    color: COLORS.success,
    description: 'Clientes regulares na rede Ford',
  },
  at_risk: {
    name: 'Em Risco',
    color: COLORS.warning,
    description: 'Clientes que podem sair',
  },
  lost: {
    name: 'Perdido',
    color: COLORS.danger,
    description: 'Clientes inativos há muito tempo',
  },
  new: {
    name: 'Novo',
    color: COLORS.secondary,
    description: 'Clientes novos na base',
  },
} as const;

export const SERVICE_TYPES = {
  revision: 'Revisão',
  oil_change: 'Troca de Óleo',
  warranty: 'Garantia',
  repair: 'Reparo',
} as const;

export const WARRANTY_STATUS = {
  active: 'Ativa',
  expiring_soon: 'Vencendo em breve',
  expired: 'Vencida',
} as const;

export const REVISION_INTERVAL_KM = 10000;

export const NPS_THRESHOLD = {
  promoter: 9,
  passive: 7,
  detractor: 0,
} as const;

export const RISK_SCORE_THRESHOLDS = {
  loyal: 20,
  at_risk: 60,
  lost: 80,
} as const;

export const FORD_MODELS = [
  'Ka',
  'Fiesta',
  'EcoSport',
  'Ranger',
  'Bronco',
  'Territory',
] as const;

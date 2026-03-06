/**
 * TsaoCaa Columbus brand colors — Premium Tea House Style
 * Inspired by HeyTea, Nayuki, Chagee, Tea'Stone
 */
export const Colors = {
  // Brand primary — Tea Green
  primary: '#2F6F4F',
  primaryLight: '#3D8A63',

  // Brand accent — Tea Green (unified brand)
  accent: '#2F6F4F',
  accentLight: '#A8C3A0',

  // Background
  background: '#FAF8F3',
  surface: '#FFFFFF',
  surfaceWarm: '#F3EFE7',

  // Text — Charcoal-based
  textPrimary: '#1F1F1F',
  textSecondary: '#6B6B6B',
  textMuted: '#9CA3AF',
  textOnDark: '#FFFFFF',

  // Status
  success: '#3A9A5C',
  error: '#D94F4F',
  warning: '#E8A838',
  info: '#4A90C4',

  // Game UI
  gameBackground: '#FAF8F3',
  wheelBorder: '#2F6F4F',

  // Divider / border — Warm Beige
  border: '#EDE6DB',
  divider: '#EDE6DB',

  // Tab bar
  tabActive: '#2F6F4F',
  tabInactive: '#9CA3AF',
} as const;

/**
 * Typography constants for Inter font family
 */
export const Typography = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
} as const;

/**
 * Shared shadow presets for cards and elevated elements
 */
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardElevated: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
} as const;

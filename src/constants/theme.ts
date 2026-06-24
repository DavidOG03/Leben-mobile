/**
 * Leben Mobile — Design System Constants
 *
 * NativeWind (Tailwind) is used for all styling via className props.
 * These constants are only needed for values that can't be expressed
 * as Tailwind classes: SVG fill/stroke, gradient stops, Animated.Value, etc.
 */

import '@/global.css';
import { Platform } from 'react-native';

// ── Leben Brand Colours (matches web globals.css exactly) ─────────────────────
export const LC = {
  // Backgrounds
  bgPrimary:       '#0a0a0a',
  bgCard:          '#161616',
  bgSecondary:     '#1a1a1a',
  bgElement:       '#212225',

  // Borders
  border:          '#222222',
  borderSubtle:    '#1a1a1a',

  // Accent — purple gradient family
  accent:          '#7c6af0',
  accentLight:     '#9d8ff5',
  accentDim:       'rgba(124,106,240,0.12)',
  accentBorder:    'rgba(124,106,240,0.2)',

  // Text
  textPrimary:     '#f0f0f0',
  textSecondary:   '#acacac',
  textMuted:       '#555555',
  textDim:         '#444444',

  // Semantic
  success:         '#4caf7d',
  successDim:      'rgba(76,175,125,0.12)',
  error:           '#f87171',
  errorBg:         'rgba(239,68,68,0.1)',
  errorBorder:     'rgba(239,68,68,0.3)',

  // Priority
  prioHigh:        '#ef4444',
  prioMedium:      '#f59e0b',
  prioLow:         '#6b7fff',

  // Tags
  tagWork:         'rgba(107,127,255,0.15)',
  tagPersonal:     'rgba(76,175,125,0.15)',
} as const;

export type LebenColor = typeof LC[keyof typeof LC];

// ── Legacy Expo template colours (kept for ThemeProvider compat) ───────────────
export const Colors = {
  light: {
    text:                '#000000',
    background:          '#ffffff',
    backgroundElement:   '#F0F0F3',
    backgroundSelected:  '#E0E1E6',
    textSecondary:       '#60646C',
  },
  dark: {
    text:                '#f0f0f0',
    background:          '#0a0a0a',
    backgroundElement:   '#161616',
    backgroundSelected:  '#1a1a1a',
    textSecondary:       '#acacac',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// ── Fonts ──────────────────────────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans:    'system-ui',
    serif:   'ui-serif',
    rounded: 'ui-rounded',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    'var(--font-display)',
    serif:   'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono:    'var(--font-mono)',
  },
});

// ── Spacing scale (4px base) ──────────────────────────────────────────────────
export const Spacing = {
  half: 2,
  one:  4,
  two:  8,
  three: 16,
  four:  24,
  five:  32,
  six:   64,
} as const;

export const BottomTabInset  = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;


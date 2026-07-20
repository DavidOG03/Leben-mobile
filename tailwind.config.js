/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4: use the content array to scan ALL app source files
  content: ['./src/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Leben Brand Palette ──────────
        'leben-bg': 'var(--bg-primary)',
        'leben-bg-card': 'var(--bg-card)',
        'leben-bg-secondary': 'var(--bg-secondary)',
        'leben-bg-element': 'var(--bg-element)',
        'leben-border': 'var(--border-primary)',
        'leben-border-subtle': 'var(--border-subtle)',

        // Accent
        'leben-accent': 'var(--accent-blue)',
        'leben-accent-light': 'var(--accent-blue-light)',
        'leben-accent-dim': 'rgba(107,127,255,0.12)',

        // Text
        'leben-text': 'var(--text-primary)',
        'leben-text-2': 'var(--text-secondary)',
        'leben-text-muted': 'var(--text-muted)',
        'leben-text-dim': 'var(--text-dim)',

        // Semantic
        'leben-success': '#4caf7d',
        'leben-error': '#f87171',
        'leben-error-bg': 'rgba(239,68,68,0.1)',

        // Priority badges
        'prio-high': '#ef4444',
        'prio-medium': '#f59e0b',
        'prio-low': '#6b7fff',

        // Semantic UI States
        'state-success-bg': 'var(--state-success-bg)',
        'state-success-border': 'var(--state-success-border)',
        'tag-work-bg': 'var(--tag-work-bg)',
        'tag-work-border': 'var(--tag-work-border)',
        'tag-work-text': 'var(--tag-work-text)',
        'tag-personal-bg': 'var(--tag-personal-bg)',
        'tag-personal-border': 'var(--tag-personal-border)',
        'tag-personal-text': 'var(--tag-personal-text)',
        'brand-deep': 'var(--brand-deep)',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        'geist-medium': ['Geist-Medium', 'system-ui', 'sans-serif'],
        'geist-semibold': ['Geist-SemiBold', 'system-ui', 'sans-serif'],
        'geist-bold': ['Geist-Bold', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        input: '10px',
        btn: '10px',
        chip: '20px',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4: use the content array to scan ALL app source files
  content: ['./src/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── Leben Brand Palette (matches web globals.css exactly) ──────────
        'leben-bg':          '#0a0a0a',
        'leben-bg-card':     '#161616',
        'leben-bg-secondary':'#1a1a1a',
        'leben-bg-element':  '#212225',
        'leben-border':      '#222222',
        'leben-border-subtle':'#1a1a1a',

        // Accent — #7c6af0 used in sidebar active, #6b7fff in CSS vars
        'leben-accent':      '#7c6af0',
        'leben-accent-light':'#9d8ff5',
        'leben-accent-dim':  'rgba(107,127,255,0.12)',

        // Text
        'leben-text':        '#f0f0f0',
        'leben-text-2':      '#acacac',
        'leben-text-muted':  '#555555',
        'leben-text-dim':    '#444444',

        // Semantic
        'leben-success':     '#4caf7d',
        'leben-error':       '#f87171',
        'leben-error-bg':    'rgba(239,68,68,0.1)',

        // Priority badges
        'prio-high':         '#ef4444',
        'prio-medium':       '#f59e0b',
        'prio-low':          '#6b7fff',

        // Tag chips
        'tag-work':          'rgba(107,127,255,0.15)',
        'tag-personal':      'rgba(76,175,125,0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card:  '16px',
        input: '10px',
        btn:   '10px',
        chip:  '20px',
      },
    },
  },
  plugins: [],
};

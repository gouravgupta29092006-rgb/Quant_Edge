import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ── QuantEdge Design System v2 ─────────────────────────────
      colors: {
        // Background — deeper, richer darks
        bg: {
          primary:   '#05060A',   // Near-pure black
          secondary: '#0C0E15',   // Card base
          tertiary:  '#111420',   // Input / elevated
          elevated:  '#181C2E',   // Hover / panel
          overlay:   'rgba(5, 6, 10, 0.9)',
        },
        // Brand — indigo staying as primary identity
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        // Accent — electric cyan for data highlights
        accent: {
          DEFAULT: '#06B6D4',
          light:   '#22D3EE',
          dark:    '#0891B2',
          bg:      'rgba(6, 182, 212, 0.08)',
        },
        // Gold — P&L, premium highlights
        gold: {
          DEFAULT: '#F59E0B',
          light:   '#FCD34D',
          dark:    '#D97706',
          bg:      'rgba(245, 158, 11, 0.08)',
        },
        // Semantic
        success: {
          DEFAULT: '#00D395',
          light:   '#34EFB0',
          dark:    '#00A873',
          bg:      'rgba(0, 211, 149, 0.08)',
        },
        danger: {
          DEFAULT: '#FF4466',
          light:   '#FF6B85',
          dark:    '#E5193D',
          bg:      'rgba(255, 68, 102, 0.08)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light:   '#FCD34D',
          bg:      'rgba(245, 158, 11, 0.08)',
        },
        // Text hierarchy
        text: {
          primary:   '#F0F4FF',
          secondary: '#8896B3',
          tertiary:  '#4E5A7A',
          disabled:  '#2D3553',
        },
        // Borders
        border: {
          DEFAULT: '#161C2E',
          light:   '#1F2744',
          bright:  '#2D3A5E',
        },
      },

      // ── Typography ─────────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs':    ['0.75rem',  { lineHeight: '1rem',    letterSpacing: '0.01em' }],
        'sm':    ['0.8125rem',{ lineHeight: '1.25rem', letterSpacing: '0' }],
        'base':  ['0.9375rem',{ lineHeight: '1.5rem',  letterSpacing: '-0.01em' }],
        'lg':    ['1.0625rem',{ lineHeight: '1.65rem', letterSpacing: '-0.01em' }],
        'xl':    ['1.1875rem',{ lineHeight: '1.75rem', letterSpacing: '-0.02em' }],
        '2xl':   ['1.375rem', { lineHeight: '1.9rem',  letterSpacing: '-0.02em' }],
        '3xl':   ['1.75rem',  { lineHeight: '2.1rem',  letterSpacing: '-0.03em' }],
        '4xl':   ['2.25rem',  { lineHeight: '2.5rem',  letterSpacing: '-0.04em' }],
        '5xl':   ['3rem',     { lineHeight: '1.05',    letterSpacing: '-0.04em' }],
        '6xl':   ['3.75rem',  { lineHeight: '1',       letterSpacing: '-0.05em' }],
      },

      // ── Animations ─────────────────────────────────────────────
      animation: {
        'fade-in':       'fadeIn 0.25s ease-out',
        'fade-up':       'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-up-sm':    'fadeUpSm 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':      'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right':   'slideRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':      'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer':       'shimmer 2s infinite',
        'ticker':        'ticker 30s linear infinite',
        'glow-pulse':    'glowPulse 2.5s ease-in-out infinite alternate',
        'float':         'float 4s ease-in-out infinite',
        'counter':       'counterUp 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        'ping-sm':       'pingSm 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'spin-slow':     'spin 4s linear infinite',
        'pulse-slow':    'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-x':    'gradientX 4s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUpSm: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        glowPulse: {
          '0%':   { opacity: '0.6', boxShadow: '0 0 12px rgba(99,102,241,0.3)' },
          '100%': { opacity: '1',   boxShadow: '0 0 28px rgba(99,102,241,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        counterUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pingSm: {
          '75%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },

      // ── Shadows ────────────────────────────────────────────────
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-lg':    '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.7), 0 4px 16px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow-xs':    '0 0 8px rgba(99,102,241,0.25)',
        'glow-sm':    '0 0 16px rgba(99,102,241,0.35)',
        'glow':       '0 0 28px rgba(99,102,241,0.45)',
        'glow-lg':    '0 0 48px rgba(99,102,241,0.55)',
        'glow-cyan':  '0 0 20px rgba(6,182,212,0.4)',
        'glow-green': '0 0 20px rgba(0,211,149,0.35)',
        'glow-red':   '0 0 20px rgba(255,68,102,0.35)',
        'inner':      'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.2)',
        'input':      '0 0 0 3px rgba(99,102,241,0.15)',
      },

      // ── Background Images ──────────────────────────────────────
      backgroundImage: {
        'gradient-brand':    'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
        'gradient-brand-v':  'linear-gradient(180deg, #6366F1 0%, #4F46E5 100%)',
        'gradient-dark':     'linear-gradient(135deg, #05060A 0%, #0C0E15 100%)',
        'gradient-card':     'linear-gradient(145deg, #0C0E15 0%, #111420 100%)',
        'gradient-success':  'linear-gradient(135deg, #00D395 0%, #00A873 100%)',
        'gradient-danger':   'linear-gradient(135deg, #FF4466 0%, #E5193D 100%)',
        'gradient-gold':     'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'gradient-radial':   'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'shimmer':           'linear-gradient(90deg, #0C0E15 25%, #161C2E 50%, #0C0E15 75%)',
        'hero-glow':         'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%)',
        'mesh-gradient':     'radial-gradient(at 40% 20%, rgba(99,102,241,0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(6,182,212,0.08) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(99,102,241,0.06) 0px, transparent 50%)',
      },

      // ── Border Radius ──────────────────────────────────────────
      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.25rem',
        '3xl': '2rem',
      },

      // ── Spacing ────────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '18':  '4.5rem',
        '88':  '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },

      // ── Backdrop Blur ──────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
        '3xl': '48px',
      },

      // ── Screen sizes ───────────────────────────────────────────
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
}

export default config

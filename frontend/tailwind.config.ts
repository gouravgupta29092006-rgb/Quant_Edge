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
      // ── QuantEdge Design System Colors ─────────────────────────
      colors: {
        // Background system (dark-first)
        bg: {
          primary:   '#0A0B0E',   // Near-black — main background
          secondary: '#10121A',   // Dark navy — cards
          tertiary:  '#161928',   // Slightly lighter — input fields
          elevated:  '#1E2238',   // Elevated panels
          overlay:   'rgba(10, 11, 14, 0.85)',
        },
        // Brand — electric indigo to violet
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',   // Primary brand color
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        // Accent — electric cyan
        accent: {
          DEFAULT: '#22D3EE',
          dark:    '#0891B2',
          light:   '#67E8F9',
        },
        // Semantic colors
        success: {
          DEFAULT: '#10B981',
          light:   '#34D399',
          dark:    '#059669',
          bg:      'rgba(16, 185, 129, 0.1)',
        },
        danger: {
          DEFAULT: '#EF4444',
          light:   '#F87171',
          dark:    '#DC2626',
          bg:      'rgba(239, 68, 68, 0.1)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light:   '#FCD34D',
          bg:      'rgba(245, 158, 11, 0.1)',
        },
        // Text
        text: {
          primary:   '#F1F5F9',
          secondary: '#94A3B8',
          tertiary:  '#64748B',
          disabled:  '#475569',
        },
        // Border
        border: {
          DEFAULT: '#1E2238',
          light:   '#2D3553',
          bright:  '#374151',
        },
      },

      // ── Typography ─────────────────────────────────────────────
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'xs':    ['0.75rem',  { lineHeight: '1rem' }],
        'sm':    ['0.875rem', { lineHeight: '1.25rem' }],
        'base':  ['1rem',     { lineHeight: '1.5rem' }],
        'lg':    ['1.125rem', { lineHeight: '1.75rem' }],
        'xl':    ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl':   ['1.5rem',   { lineHeight: '2rem' }],
        '3xl':   ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl':   ['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl':   ['3rem',     { lineHeight: '1.1' }],
      },

      // ── Animations ─────────────────────────────────────────────
      animation: {
        'fade-in':      'fadeIn 0.3s ease-out',
        'slide-up':     'slideUp 0.4s ease-out',
        'slide-down':   'slideDown 0.4s ease-out',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':      'shimmer 2s infinite',
        'glow':         'glow 2s ease-in-out infinite alternate',
        'float':        'float 3s ease-in-out infinite',
        'spin-slow':    'spin 3s linear infinite',
        'number-up':    'numberUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        numberUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },

      // ── Shadows ────────────────────────────────────────────────
      boxShadow: {
        'card':    '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'card-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
        'glow-sm': '0 0 10px rgba(99, 102, 241, 0.3)',
        'glow':    '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.5)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'success': '0 0 15px rgba(16, 185, 129, 0.3)',
        'danger':  '0 0 15px rgba(239, 68, 68, 0.3)',
      },

      // ── Backdrop Blur ──────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
      },

      // ── Border Radius ──────────────────────────────────────────
      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },

      // ── Spacing ────────────────────────────────────────────────
      spacing: {
        '18':  '4.5rem',
        '88':  '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },

      // ── Gradients (via bg utilities) ───────────────────────────
      backgroundImage: {
        'gradient-brand':    'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-dark':     'linear-gradient(135deg, #0A0B0E 0%, #10121A 100%)',
        'gradient-card':     'linear-gradient(145deg, #10121A 0%, #161928 100%)',
        'gradient-success':  'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gradient-danger':   'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        'gradient-shine':    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
        'shimmer':           'linear-gradient(90deg, #161928 25%, #1E2238 50%, #161928 75%)',
        'hero-glow':         'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}

export default config

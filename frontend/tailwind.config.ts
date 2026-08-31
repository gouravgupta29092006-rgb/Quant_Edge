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
      // ── QuantEdge Design System v3 ────────────────────────────────
      colors: {
        bg: {
          base:      '#020617',
          primary:   '#020617',
          card:      '#0E1223',
          secondary: '#0F172A',
          elevated:  '#1E293B',
          hover:     '#1A1E2F',
          sidebar:   '#0A0E1A',
          overlay:   'rgba(2,6,23,0.92)',
        },
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
        accent: {
          DEFAULT: '#06B6D4',
          light:   '#22D3EE',
          dark:    '#0891B2',
          bg:      'rgba(6,182,212,0.08)',
        },
        success: {
          DEFAULT: '#22C55E',
          light:   '#4ADE80',
          dark:    '#16A34A',
          bg:      'rgba(34,197,94,0.08)',
        },
        danger: {
          DEFAULT: '#EF4444',
          light:   '#F87171',
          dark:    '#DC2626',
          bg:      'rgba(239,68,68,0.08)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light:   '#FCD34D',
          bg:      'rgba(245,158,11,0.08)',
        },
        gold: {
          DEFAULT: '#F59E0B',
          light:   '#FCD34D',
          dark:    '#D97706',
        },
        text: {
          primary:   '#F8FAFC',
          secondary: '#94A3B8',
          muted:     '#475569',
          disabled:  '#334155',
        },
        border: {
          DEFAULT: '#1E293B',
          light:   '#334155',
          bright:  '#475569',
        },
      },

      // ── Typography ─────────────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Calistoga', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs':    ['0.75rem',   { lineHeight: '1rem',    letterSpacing: '0.01em' }],
        'sm':    ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '0' }],
        'base':  ['0.9375rem', { lineHeight: '1.6rem',  letterSpacing: '-0.01em' }],
        'lg':    ['1.0625rem', { lineHeight: '1.7rem',  letterSpacing: '-0.01em' }],
        'xl':    ['1.1875rem', { lineHeight: '1.8rem',  letterSpacing: '-0.02em' }],
        '2xl':   ['1.375rem',  { lineHeight: '1.9rem',  letterSpacing: '-0.02em' }],
        '3xl':   ['1.75rem',   { lineHeight: '2.1rem',  letterSpacing: '-0.03em' }],
        '4xl':   ['2.25rem',   { lineHeight: '2.5rem',  letterSpacing: '-0.04em' }],
        '5xl':   ['3rem',      { lineHeight: '1.05',    letterSpacing: '-0.04em' }],
      },

      // ── Animations ─────────────────────────────────────────────────
      animation: {
        'fade-in':    'fadeIn 0.25s ease-out',
        'fade-up':    'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':   'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer':    'shimmer 1.8s infinite',
        'ticker':     'ticker 35s linear infinite',
        'float':      'float 4s ease-in-out infinite',
        'spin-slow':  'spin 4s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-sm':    'pingSm 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'gradient-x': 'gradientX 4s ease infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp:    { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { '0%': { opacity: '0', transform: 'scale(0.94)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        ticker:    { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        float:     { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        gradientX: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        pingSm:    { '75%, 100%': { transform: 'scale(1.6)', opacity: '0' } },
      },

      // ── Shadows ─────────────────────────────────────────────────────
      boxShadow: {
        'card':       '0 1px 0 rgba(255,255,255,0.03) inset, 0 4px 24px rgba(0,0,0,0.4)',
        'card-lg':    '0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-hover': '0 16px 48px rgba(0,0,0,0.6), 0 4px 16px rgba(129,140,248,0.08)',
        'glow-brand': '0 0 0 1px rgba(129,140,248,0.3), 0 0 28px rgba(129,140,248,0.12)',
        'glow-green': '0 0 0 1px rgba(34,197,94,0.3),  0 0 20px rgba(34,197,94,0.1)',
        'glow-red':   '0 0 0 1px rgba(239,68,68,0.3),  0 0 20px rgba(239,68,68,0.1)',
        'glow-cyan':  '0 0 0 1px rgba(6,182,212,0.3),  0 0 20px rgba(6,182,212,0.1)',
        'input':      '0 0 0 3px rgba(129,140,248,0.12)',
        'inner':      'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.15)',
      },

      // ── Backgrounds ─────────────────────────────────────────────────
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #818CF8 0%, #06B6D4 100%)',
        'gradient-dark':    'linear-gradient(135deg, #020617 0%, #0F172A 100%)',
        'gradient-card':    'linear-gradient(145deg, #0E1223 0%, #0B1020 100%)',
        'gradient-success': 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
        'gradient-danger':  'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        'gradient-gold':    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'mesh-bg': `radial-gradient(ellipse 60% 40% at 10% 0%, rgba(129,140,248,0.06) 0%, transparent 60%),
                    radial-gradient(ellipse 40% 30% at 90% 10%, rgba(6,182,212,0.04) 0%, transparent 50%)`,
        'shimmer': 'linear-gradient(90deg, #0E1223 25%, #1E293B 50%, #0E1223 75%)',
      },

      // ── Radius ──────────────────────────────────────────────────────
      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.25rem',
        '3xl': '2rem',
      },

      // ── Spacing ─────────────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '18':  '4.5rem',
        '88':  '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },

      // ── Backdrop Blur ────────────────────────────────────────────────
      backdropBlur: { xs: '2px', '3xl': '48px' },

      // ── Screens ─────────────────────────────────────────────────────
      screens: { 'xs': '480px' },
    },
  },
  plugins: [],
}

export default config

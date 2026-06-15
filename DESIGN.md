# QuantEdge — Design System

> **Version:** 1.0.0 | **Status:** Active | **Date:** June 2026
> **Philosophy:** Hybrid Fintech Command Center — Professional · Intelligent · Analytical · Premium

---

## TABLE OF CONTENTS

1. [Design Philosophy](#1-design-philosophy)
2. [Brand Identity](#2-brand-identity)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing & Layout](#5-spacing--layout)
6. [Iconography](#6-iconography)
7. [Component Library](#7-component-library)
8. [Data Visualization Standards](#8-data-visualization-standards)
9. [Motion & Animation](#9-motion--animation)
10. [Loading States](#10-loading-states)
11. [Empty States](#11-empty-states)
12. [Error States](#12-error-states)
13. [Page Layout Patterns](#13-page-layout-patterns)
14. [Responsive Design](#14-responsive-design)
15. [Accessibility Standards](#15-accessibility-standards)
16. [Dark Mode](#16-dark-mode)
17. [UI Patterns — Module by Module](#17-ui-patterns--module-by-module)

---

## 1. DESIGN PHILOSOPHY

### The Hybrid Fintech Command Center

QuantEdge sits at the intersection of four reference products:

```
TradingView    →  Chart-first layouts, technical precision, dark aesthetic
Bloomberg      →  Information density, structured hierarchy, data authority
Wealthfront    →  Portfolio UX clarity, clean summaries, calm confidence
Perplexity     →  AI-first interaction, streaming, research workflow
```

### What We Are Not
- ❌ Generic admin dashboard (Shadcn defaults with no customization)
- ❌ Crypto casino (neon overload, excessive animation, gimmicky widgets)
- ❌ Consumer bank app (overly simplified, low data density)
- ❌ SaaS template (generic cards, no personality)

### What We Are
- ✅ A professional-grade fintech tool with personality
- ✅ Dark-first, chart-first, intelligence-first
- ✅ Data-dense but never cluttered
- ✅ Premium feel through micro-interactions, not decoration

### Three Core Principles

**Principle 1 — Data Earns Its Place**
Every number, every metric, every data point must justify being on screen. No decorative stats. No vanity metrics. Each piece of data answers a user question.

**Principle 2 — Intelligence is a First-Class Citizen**
AI is not a sidebar feature — it is woven into every module. The purple AI accent color signals intelligence everywhere it appears.

**Principle 3 — State is Always Communicated**
The user must always know: Is data loading? Is it live? Is it cached? Is an action processing? No ambiguity. Every state has a visual representation.

---

## 2. BRAND IDENTITY

### Personality Attributes
```
Professional    →  Serious about finance, not intimidating
Intelligent     →  Backed by AI, informed by data
Analytical      →  Numbers-first, precision-driven
Modern          →  Current design sensibilities, not trendy
Trustworthy     →  Consistent, reliable, transparent
Premium         →  High-quality feel without being expensive-looking
```

### Voice & Tone
- Confident but not arrogant
- Educational but not condescending
- Technical but always explained
- AI language is helpful, never robotic

### Logo Concept
```
Mark:    Q  (stylized, sharp geometry, thin weight)
Full:    QuantEdge  (Inter, 600 weight, tracking +0.02em)
Color:   White on dark, or #8B5CF6 accent variant
Sizing:  Mark minimum 20px, Full wordmark minimum 80px wide
```

---

## 3. COLOR SYSTEM

### 3.1 Core Palette — CSS Custom Properties

```css
:root {
  /* ─── BACKGROUNDS ─── */
  --bg-base:        #0B1220;   /* Page background — deepest level */
  --bg-surface:     #111827;   /* Cards, panels — primary surface */
  --bg-secondary:   #1A2235;   /* Secondary cards, sidebars */
  --bg-elevated:    #243047;   /* Dropdowns, popovers, modals */
  --bg-hover:       #2D3748;   /* Interactive hover state */
  --bg-active:      #374151;   /* Pressed / selected state */

  /* ─── BORDERS ─── */
  --border-default: #2D3748;   /* Standard dividers */
  --border-subtle:  #1E293B;   /* Barely-there separation */
  --border-strong:  #374151;   /* Emphasized borders */
  --border-brand:   #8B5CF6;   /* Focused inputs, active tabs */

  /* ─── TEXT ─── */
  --text-primary:   #F9FAFB;   /* Headings, primary data */
  --text-secondary: #94A3B8;   /* Labels, supporting text */
  --text-muted:     #64748B;   /* Timestamps, captions, disabled */
  --text-inverse:   #0B1220;   /* Text on light backgrounds */

  /* ─── SEMANTIC COLORS ─── */
  --color-success:  #22C55E;   /* Gains, positive P&L, uptrend */
  --color-danger:   #EF4444;   /* Losses, negative P&L, downtrend */
  --color-warning:  #F59E0B;   /* Cautions, alerts, medium risk */
  --color-info:     #3B82F6;   /* Info badges, neutral indicators */
  --color-ai:       #8B5CF6;   /* All AI-generated content */

  /* ─── SEMANTIC ALPHA VARIANTS ─── */
  --success-bg:     rgba(34, 197, 94, 0.10);
  --success-border: rgba(34, 197, 94, 0.20);
  --danger-bg:      rgba(239, 68, 68, 0.10);
  --danger-border:  rgba(239, 68, 68, 0.20);
  --warning-bg:     rgba(245, 158, 11, 0.10);
  --warning-border: rgba(245, 158, 11, 0.20);
  --info-bg:        rgba(59, 130, 246, 0.10);
  --info-border:    rgba(59, 130, 246, 0.20);
  --ai-bg:          rgba(139, 92, 246, 0.10);
  --ai-border:      rgba(139, 92, 246, 0.20);

  /* ─── CHART PALETTE ─── */
  --chart-primary:  #8B5CF6;   /* Primary portfolio line */
  --chart-compare:  #3B82F6;   /* Benchmark / comparison line */
  --chart-gain:     #22C55E;   /* Positive area fill */
  --chart-loss:     #EF4444;   /* Negative area fill */
  --chart-candle-up: #22C55E;
  --chart-candle-dn: #EF4444;
  --chart-grid:     rgba(45, 55, 72, 0.6);
  --chart-crosshair: rgba(148, 163, 184, 0.4);

  /* ─── GRADIENT DEFINITIONS ─── */
  --gradient-brand: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
  --gradient-gain:  linear-gradient(180deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.00) 100%);
  --gradient-loss:  linear-gradient(180deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.00) 100%);
  --gradient-hero:  linear-gradient(180deg, #111827 0%, #0B1220 100%);
}
```

### 3.2 Color Usage Rules

| Context | Color | Never Use |
|---|---|---|
| Positive P&L, gains, uptrend | `--color-success` (#22C55E) | Blue, yellow |
| Negative P&L, losses, downtrend | `--color-danger` (#EF4444) | Orange, gray |
| AI content, AI badges | `--color-ai` (#8B5CF6) | Any other color |
| Portfolio chart line | `--chart-primary` | Red or green |
| Benchmark chart line | `--chart-compare` | Purple |
| Warnings, medium risk | `--color-warning` | Red (implies loss) |
| Info callouts | `--color-info` | Purple (implies AI) |

### 3.3 Contrast Ratios (WCAG 2.1 AA)

| Foreground | Background | Ratio | Pass |
|---|---|---|---|
| `--text-primary` (#F9FAFB) | `--bg-surface` (#111827) | 15.8:1 | ✅ AAA |
| `--text-secondary` (#94A3B8) | `--bg-surface` (#111827) | 5.2:1 | ✅ AA |
| `--text-muted` (#64748B) | `--bg-surface` (#111827) | 3.1:1 | ✅ AA Large |
| `--color-success` (#22C55E) | `--bg-surface` (#111827) | 4.6:1 | ✅ AA |
| `--color-danger` (#EF4444) | `--bg-surface` (#111827) | 4.8:1 | ✅ AA |

---

## 4. TYPOGRAPHY

### 4.1 Font Stack

```css
/* Primary — Inter (all UI text) */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Code / Monospace — for ticker symbols, numbers in tables */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

/* Alternative — Geist (acceptable substitute for Inter) */
--font-sans-alt: 'Geist', 'Inter', sans-serif;
```

### 4.2 Type Scale

```css
/* ─── DISPLAY — Hero numbers, portfolio value ─── */
--text-display-2xl: 4.5rem;   /* 72px — Portfolio hero value */
--text-display-xl:  3.75rem;  /* 60px — Never used in UI */
--text-display-lg:  3rem;     /* 48px — Major hero numbers */

/* ─── HEADINGS ─── */
--text-4xl: 2.25rem;   /* 36px — Page titles (rare) */
--text-3xl: 1.875rem;  /* 30px — Section heroes */
--text-2xl: 1.5rem;    /* 24px — Module titles */
--text-xl:  1.25rem;   /* 20px — Card headings */
--text-lg:  1.125rem;  /* 18px — Sub-headings */

/* ─── BODY ─── */
--text-base: 1rem;     /* 16px — Body, default */
--text-sm:   0.875rem; /* 14px — Labels, supporting text */
--text-xs:   0.75rem;  /* 12px — Captions, badges, timestamps */
--text-2xs:  0.625rem; /* 10px — Only for compact data tables */

/* ─── FONT WEIGHTS ─── */
--font-thin:     100;
--font-regular:  400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
--font-black:    900;

/* ─── LINE HEIGHTS ─── */
--leading-tight:  1.2;   /* Display, headings */
--leading-snug:   1.375; /* Sub-headings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed:1.625; /* AI prose, long-form */

/* ─── LETTER SPACING ─── */
--tracking-tight:  -0.02em; /* Large display numbers */
--tracking-normal:  0;
--tracking-wide:   +0.05em; /* ALL CAPS labels, badges */
--tracking-wider:  +0.10em; /* CATEGORY labels */
```

### 4.3 Typography Usage Patterns

```
Portfolio Value (hero):   display-2xl, bold, tracking-tight, text-primary
Daily P&L number:         text-2xl, semibold, color-success or color-danger
Section Title:            text-xl, semibold, text-primary
Card Label:               text-xs, medium, tracking-wide, UPPERCASE, text-muted
Ticker Symbol:            text-sm, semibold, font-mono, text-primary
Price number:             text-base, semibold, font-mono, text-primary
Timestamp:                text-xs, regular, text-muted
AI Prose:                 text-sm, regular, leading-relaxed, text-secondary
Table header:             text-xs, medium, tracking-wide, UPPERCASE, text-muted
Table body:               text-sm, regular, text-primary
Badge text:               text-xs, medium, tracking-wide
Button label:             text-sm, semibold
```

---

## 5. SPACING & LAYOUT

### 5.1 Spacing Scale (4px base grid)

```css
--space-0:    0px;
--space-px:   1px;
--space-0.5:  2px;
--space-1:    4px;
--space-1.5:  6px;
--space-2:    8px;
--space-2.5:  10px;
--space-3:    12px;
--space-3.5:  14px;
--space-4:    16px;
--space-5:    20px;
--space-6:    24px;
--space-7:    28px;
--space-8:    32px;
--space-9:    36px;
--space-10:   40px;
--space-12:   48px;
--space-14:   56px;
--space-16:   64px;
--space-20:   80px;
--space-24:   96px;
```

### 5.2 Application Layout

```
┌────────────────────────────────────────────────────────────┐
│  TOPBAR                                          h: 64px   │
│  Logo | Nav | Search | AI | Notif | Avatar                 │
├──────────────┬─────────────────────────────────────────────┤
│              │                                             │
│   SIDEBAR    │         MAIN CONTENT AREA                   │
│   w: 240px   │         max-w: 1440px, padded 32px          │
│   (collapsed │                                             │
│    w: 64px)  │                                             │
│              │                                             │
│              │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

### 5.3 Grid System

```css
/* Dashboard grid — 12-column responsive */
.grid-dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);      /* 24px gutters */
  padding: var(--space-8);  /* 32px page padding */
}

/* Widget spanning rules */
.col-full:    grid-column: span 12;   /* Full width */
.col-2-3:     grid-column: span 8;   /* 2/3 width */
.col-1-3:     grid-column: span 4;   /* 1/3 width */
.col-1-2:     grid-column: span 6;   /* Half */
.col-1-4:     grid-column: span 3;   /* Quarter */
```

### 5.4 Border Radius

```css
--radius-none: 0;
--radius-sm:   4px;   /* Badges, chips, inputs */
--radius-md:   8px;   /* Buttons, small cards */
--radius-lg:   12px;  /* Cards, panels */
--radius-xl:   16px;  /* Large cards, modals */
--radius-2xl:  24px;  /* Hero sections */
--radius-full: 9999px; /* Avatars, pills, tags */
```

### 5.5 Shadows

```css
--shadow-sm:  0 1px 2px 0 rgba(0,0,0,0.3);
--shadow-md:  0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3);
--shadow-lg:  0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -4px rgba(0,0,0,0.3);
--shadow-xl:  0 20px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.4);

/* Elevation glow — for focused/active state */
--glow-brand: 0 0 0 3px rgba(139,92,246,0.25);
--glow-success: 0 0 0 3px rgba(34,197,94,0.20);
--glow-danger:  0 0 0 3px rgba(239,68,68,0.20);
```

---

## 6. ICONOGRAPHY

### 6.1 Icon Library: Lucide React
Primary icon set. Stroke-based, consistent weight (1.5px stroke), clean geometry.

```tsx
// Standard import pattern
import { TrendingUp, TrendingDown, AlertCircle, Brain } from 'lucide-react';

// Sizing conventions
<Icon size={12} />   // Inline with xs text, badges
<Icon size={14} />   // Inline with sm text
<Icon size={16} />   // Default — most UI contexts
<Icon size={20} />   // Section labels, nav icons
<Icon size={24} />   // Empty state, primary actions
<Icon size={32} />   // Hero icons, onboarding
<Icon size={48} />   // Large empty state illustrations
```

### 6.2 Module Icons (Nav Sidebar)

```
Dashboard:      LayoutDashboard
Markets:        TrendingUp
Portfolio:      Briefcase
Analytics:      BarChart3
Strategies:     Sliders
News:           Newspaper
AI Insights:    Brain
Notifications:  Bell
Settings:       Settings2
Admin:          Shield
```

### 6.3 Semantic Icons

```
Gain / Positive:    TrendingUp    (color-success)
Loss / Negative:    TrendingDown  (color-danger)
AI content:         Brain / Sparkles (color-ai)
Risk:               AlertTriangle  (color-warning)
Info:               Info           (color-info)
Locked feature:     Lock           (text-muted)
Loading:            Loader2        (animated spin)
Success action:     CheckCircle2   (color-success)
Error:              XCircle        (color-danger)
Search:             Search
Filter:             SlidersHorizontal
Export:             Download
Copy:               Copy
Refresh:            RefreshCw
```

---

## 7. COMPONENT LIBRARY

### 7.1 Buttons

```tsx
// PRIMARY — Main actions (Buy, Run Backtest, Analyze)
<Button variant="primary">
  bg: --gradient-brand
  text: white, text-sm, semibold
  padding: 10px 20px
  border-radius: --radius-md
  hover: opacity 0.90
  active: scale(0.97)
  focus: --glow-brand

// SECONDARY — Supporting actions
<Button variant="secondary">
  bg: --bg-elevated
  border: 1px solid --border-default
  text: --text-primary, text-sm, semibold
  hover: bg --bg-hover, border --border-strong

// GHOST — Low emphasis
<Button variant="ghost">
  bg: transparent
  text: --text-secondary
  hover: bg --bg-hover, text --text-primary

// DANGER — Destructive actions
<Button variant="danger">
  bg: --danger-bg
  border: 1px solid --danger-border
  text: --color-danger
  hover: bg rgba(239,68,68,0.20)

// AI TRIGGER — AI-specific actions
<Button variant="ai">
  bg: --ai-bg
  border: 1px solid --ai-border
  text: --color-ai
  icon: Brain (left, 16px)
  hover: bg rgba(139,92,246,0.20)
```

**Button States:**
```
idle:     Normal appearance
loading:  Left spinner (Loader2, animating), text "Processing...", cursor not-allowed
success:  CheckCircle2 icon, green bg-tint, 2s then reverts
error:    XCircle icon, red bg-tint, shake animation 300ms
disabled: opacity 0.4, cursor not-allowed
```

### 7.2 Cards

```tsx
// STANDARD CARD
.card {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);     /* 12px */
  padding:       var(--space-6);       /* 24px */
}

// ELEVATED CARD (modals, dropdowns)
.card-elevated {
  background:    var(--bg-elevated);
  border:        1px solid var(--border-strong);
  border-radius: var(--radius-xl);
  box-shadow:    var(--shadow-xl);
}

// METRIC CARD (portfolio hero, stat widgets)
.card-metric {
  background:    var(--bg-surface);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding:       var(--space-5) var(--space-6);
  position:      relative;
  overflow:      hidden;
}

// AI CARD — purple accent left border
.card-ai {
  border-left: 3px solid var(--color-ai);
  background: linear-gradient(135deg, var(--ai-bg) 0%, var(--bg-surface) 100%);
}

// GAIN CARD — green accent
.card-gain {
  border-left: 3px solid var(--color-success);
}

// LOSS CARD — red accent
.card-loss {
  border-left: 3px solid var(--color-danger);
}
```

### 7.3 Badges & Tags

```tsx
// STATUS BADGE
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

// Variants:
.badge-success  { bg: --success-bg; color: --color-success; border: 1px solid --success-border }
.badge-danger   { bg: --danger-bg;  color: --color-danger;  border: 1px solid --danger-border }
.badge-warning  { bg: --warning-bg; color: --color-warning; border: 1px solid --warning-border }
.badge-ai       { bg: --ai-bg;      color: --color-ai;      border: 1px solid --ai-border }
.badge-info     { bg: --info-bg;    color: --color-info;    border: 1px solid --info-border }
.badge-neutral  { bg: --bg-elevated; color: --text-secondary; border: 1px solid --border-default }

// Market status badges:
.badge-live     { dot: animated green pulse + "LIVE" }
.badge-delayed  { "15 MIN DELAY" in warning style }
.badge-closed   { "MARKET CLOSED" in neutral style }
```

### 7.4 Inputs & Forms

```css
.input {
  background:    var(--bg-secondary);
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding:       10px 14px;
  color:         var(--text-primary);
  font-size:     var(--text-sm);
  transition:    border-color 150ms ease, box-shadow 150ms ease;
}

.input:focus {
  border-color: var(--color-ai);      /* Purple focus ring */
  box-shadow:   var(--glow-brand);
  outline:      none;
}

.input::placeholder {
  color: var(--text-muted);
}

.input-error {
  border-color: var(--color-danger);
  box-shadow:   var(--glow-danger);
}
```

### 7.5 Data Tables

```
HEADER ROW:
  background: --bg-base (slightly darker than surface)
  text: text-xs, font-medium, uppercase, tracking-wide, text-muted
  padding: 12px 16px
  border-bottom: 1px solid --border-default

BODY ROW:
  padding: 14px 16px
  border-bottom: 1px solid --border-subtle
  transition: background 150ms ease

HOVER STATE:
  background: --bg-hover

POSITIVE CELL (P&L):
  color: --color-success
  font: font-mono, semibold

NEGATIVE CELL:
  color: --color-danger
  font: font-mono, semibold

TICKER CELL:
  font: font-mono, semibold, text-primary
  + company name below in text-xs, text-muted
```

### 7.6 Navigation

```
TOPBAR (h: 64px):
  ┌────────────────────────────────────────────────────────┐
  │ [QE logo] [Nav tabs]              [🔍][🤖][🔔][Avatar] │
  └────────────────────────────────────────────────────────┘
  background: --bg-surface
  border-bottom: 1px solid --border-default
  backdrop-filter: blur(8px)  ← sticky scroll glass effect

SIDEBAR (w: 240px collapsed: 64px):
  background: --bg-surface
  border-right: 1px solid --border-default
  padding: 16px 12px

  NAV ITEM:
    padding: 10px 12px
    border-radius: --radius-md
    display: flex; gap: 12px; align-items: center
    color: --text-secondary
    font: text-sm, font-medium
    transition: all 150ms ease

  NAV ITEM:hover:
    background: --bg-hover
    color: --text-primary

  NAV ITEM.active:
    background: --ai-bg
    color: --color-ai
    border-left: 2px solid --color-ai

MOBILE BOTTOM NAV (h: 60px):
  background: --bg-surface
  border-top: 1px solid --border-default
  5 icons: Dashboard, Markets, Portfolio, AI, Menu
```

### 7.7 Modals & Sheets

```
MODAL:
  Overlay: rgba(0,0,0,0.7) backdrop-blur(4px)
  Container: --bg-elevated, --radius-xl, --shadow-xl
  Max widths: sm=400px, md=560px, lg=720px, xl=900px
  Header: border-bottom 1px --border-default, padding 24px
  Body: padding 24px
  Footer: border-top 1px --border-default, padding 16px 24px
  Close: top-right X button, ghost variant

SLIDE-OVER (right panel):
  Width: 480px (desktop), 100% (mobile)
  Same visual treatment as modal
  Used for: Trade form, AI insights, Backtest results detail
```

---

## 8. DATA VISUALIZATION STANDARDS

### 8.1 Chart Library: TradingView Lightweight Charts v4

**Mandatory chart configuration:**
```typescript
const chartOptions = {
  layout: {
    background: { color: 'transparent' },
    textColor: '#94A3B8',           // --text-secondary
    fontFamily: 'Inter, sans-serif',
    fontSize: 11,
  },
  grid: {
    vertLines: { color: 'rgba(45,55,72,0.4)', style: LineStyle.Dashed },
    horzLines: { color: 'rgba(45,55,72,0.4)', style: LineStyle.Dashed },
  },
  crosshair: {
    vertLine: { color: 'rgba(148,163,184,0.4)', width: 1 },
    horzLine: { color: 'rgba(148,163,184,0.4)', width: 1 },
  },
  timeScale: {
    borderColor: '#2D3748',
    tickMarkFormatter: (time) => formatDate(time),
  },
  rightPriceScale: {
    borderColor: '#2D3748',
  },
  handleScroll: true,
  handleScale: true,
};
```

### 8.2 Chart Types by Context

| Chart Type | Use Case | Configuration |
|---|---|---|
| Area Chart | Portfolio value over time | Purple line + gradient fill, dynamic green/red based on performance |
| Candlestick | Stock OHLCV price data | Green up / Red down candles |
| Line Chart | Benchmark comparison overlay | Dashed blue line |
| Bar Chart | Volume, sector performance | Color-coded by positive/negative |
| Histogram | Backtest monthly returns | Green / red based on sign |
| Donut Chart | Asset allocation | Custom palette: portfolio of colors |
| Heatmap | Correlation matrix | Green-to-Red gradient scale |
| Sparkline | Watchlist price trend | Minimal, no axis, green/red only |

### 8.3 Recharts (for non-trading charts)

Used for: analytics charts, allocation donuts, performance comparison bars

```typescript
// Color palette for multi-series charts
const CHART_COLORS = [
  '#8B5CF6',   // AI Purple — primary
  '#3B82F6',   // Blue — comparison
  '#22C55E',   // Green — gain
  '#F59E0B',   // Amber — 4th series
  '#EC4899',   // Pink — 5th series
  '#06B6D4',   // Cyan — 6th series
  '#F97316',   // Orange — 7th series
];

// Recharts theme config
const chartTheme = {
  tooltip: {
    contentStyle: {
      background: '#243047',
      border: '1px solid #374151',
      borderRadius: '8px',
    },
    labelStyle: { color: '#F9FAFB', fontWeight: 600 },
    itemStyle: { color: '#94A3B8' },
  },
};
```

### 8.4 P&L Color Rules (Strict)

```
Positive value (number > 0):   color-success (#22C55E)  +  TrendingUp icon
Negative value (number < 0):   color-danger  (#EF4444)  +  TrendingDown icon
Zero / neutral (number = 0):   text-secondary           +  Minus icon
```

**Never** use red or green for anything other than financial P&L to prevent confusion.

---

## 9. MOTION & ANIMATION

### 9.1 Principles
- Animation must be purposeful — guides attention, confirms action, communicates state
- Max 300ms for UI transitions (anything longer feels sluggish)
- Respect `prefers-reduced-motion: reduce`

### 9.2 Token Definitions

```css
--duration-instant:  100ms;   /* Immediate feedback — button press */
--duration-fast:     150ms;   /* Hover states, color transitions */
--duration-normal:   250ms;   /* Most UI transitions */
--duration-slow:     350ms;   /* Panel slides, modals */
--duration-slower:   500ms;   /* Page transitions, large reveals */

--ease-default:   cubic-bezier(0.16, 1, 0.3, 1);   /* Smooth deceleration */
--ease-spring:    cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Slight overshoot */
--ease-linear:    linear;
```

### 9.3 Animation Catalogue

| Animation | Trigger | Duration | Easing |
|---|---|---|---|
| Fade in (opacity 0→1) | Page/section load | 250ms | ease-default |
| Slide up (translateY 16px→0 + fade) | Card, widget entry | 300ms | ease-default |
| Scale in (scale 0.96→1 + fade) | Modal/dropdown open | 200ms | ease-spring |
| Scale out (scale 1→0.96 + fade) | Modal close | 150ms | ease-default |
| Slide right (translateX) | Sidebar expand | 250ms | ease-default |
| Shake (keyframe) | Form validation error | 300ms | ease-linear |
| Pulse ring (keyframe) | Live data indicator | 2s | ease-in-out, infinite |
| Skeleton shimmer | Loading placeholders | 1.5s | ease-in-out, infinite |
| Count up (number animation) | Portfolio value load | 800ms | ease-out |
| Progress bar fill | Backtest steps | Dynamic | ease-out |
| Typing cursor | AI streaming text | 700ms | step-start, infinite |

### 9.4 Reduced Motion Override

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. LOADING STATES

### 10.1 Skeleton Screens (Never show blank)

```tsx
// Base skeleton style
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-elevated) 25%,
    var(--bg-hover) 50%,
    var(--bg-elevated) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// Skeleton components needed:
SkeletonText        // Variable width text line
SkeletonTitle       // Wider, taller text block
SkeletonNumber      // Monospace-style number placeholder
SkeletonBadge       // Pill-shaped skeleton
SkeletonCard        // Full card placeholder with inner layout
SkeletonChart       // Flat rectangle, chart height
SkeletonTable       // Header + N row skeletons
SkeletonAvatar      // Circle skeleton
SkeletonSpark       // Small sparkline-sized skeleton
```

### 10.2 Module-Specific Loading Layouts

**Dashboard Loading:**
- Hero section: 2 large SkeletonNumber blocks
- Performance chart: SkeletonChart (full width, 280px height)
- 4 metric cards: SkeletonCard grid
- Watchlist: 5 SkeletonTable rows
- News: 3 SkeletonCard compact rows

**AI Response Loading:**
```
Status messages (rotate every 2s):
"Connecting to AI Analyst..."
"Analyzing your portfolio..."
"Evaluating risk metrics..."
"Reviewing sector allocation..."
"Generating insights..."
"Finalizing report..."

Visual: purple pulsing brain icon + rotating status text
After first token: switch to streaming text cursor ( | blinking)
```

**Backtest Loading:**
```
5-step progress tracker:
Step 1: [●] Loading Historical Data      ░░░░░░░░░░  5%
Step 2: [ ] Calculating Indicators       ──────────  0%
Step 3: [ ] Running Simulation           ──────────  0%
Step 4: [ ] Evaluating Performance       ──────────  0%
Step 5: [ ] Generating Report            ──────────  0%

Active step: purple indicator + animated fill
Completed: green checkmark
Pending: gray circle
```

---

## 11. EMPTY STATES

Every list or collection must have an empty state. Never show a blank container.

### 11.1 Template Structure

```
[Icon illustration — 48px, color-muted]
[Primary message — text-lg, semibold, text-primary]
[Supporting explanation — text-sm, text-secondary, max-w-sm, centered]
[CTA Button — primary variant]
```

### 11.2 Empty State Catalogue

| Module | Icon | Primary | Supporting | CTA |
|---|---|---|---|---|
| Portfolio (no holdings) | Briefcase | "Your portfolio is empty" | "Search for stocks and add your first position to get started" | "Browse Markets" |
| Watchlist | Bookmark | "No stocks on your watchlist" | "Track your favorite stocks for quick access and price alerts" | "Add Stocks" |
| Strategies | Sliders | "No strategies created yet" | "Build your first trading strategy using our visual rule builder or describe it in plain English" | "Create Strategy" |
| Backtests | BarChart | "No backtests run yet" | "Select a strategy and run your first backtest against historical data" | "Run Backtest" |
| News (personalized) | Newspaper | "Your personalized feed is empty" | "Add stocks to your portfolio or watchlist to see relevant news" | "Add Stocks" |
| Notifications | Bell | "All caught up" | "Price alerts, portfolio updates, and market events will appear here" | "Set Alerts" |
| Search results | Search | "No results for '{query}'" | "Try a different ticker symbol or company name" | "Clear Search" |
| Transactions | Receipt | "No transactions yet" | "Your buy and sell orders will appear here" | "Make a Trade" |

---

## 12. ERROR STATES

### 12.1 Error Hierarchy

```
Level 1 — Inline field error:     Below the input, color-danger, text-xs
Level 2 — Form error banner:      Top of form, danger badge + message
Level 3 — Widget error:           In place of widget content, retry button
Level 4 — Page-level error:       Full card with error illustration + retry
Level 5 — Global error (toast):   Top-right toast notification, 5s auto-dismiss
```

### 12.2 Error Messages (User-Facing Copy)

```
Market data unavailable:  "Market data is temporarily unavailable. Showing last known prices."
AI service unavailable:   "The AI analyst is temporarily busy. Please try again in a moment."
Network error:            "Connection lost. Check your internet and try again."
Session expired:          "Your session has expired. Please sign in again."
Rate limited:             "You've used your AI quota for today. Resets at midnight UTC."
Backtest timeout:         "This backtest took too long. Try a shorter date range."
Invalid ticker:           "'{ticker}' is not a valid ticker symbol on US exchanges."
Insufficient funds:       "Insufficient virtual cash. Deposit more to continue."
```

### 12.3 Toast Notifications

```
Success toast:  left-accent green  | CheckCircle2 | 3s auto-dismiss
Error toast:    left-accent red    | XCircle      | 5s auto-dismiss + persist button
Warning toast:  left-accent amber  | AlertTriangle | 4s auto-dismiss
Info toast:     left-accent blue   | Info         | 3s auto-dismiss
AI toast:       left-accent purple | Brain        | 4s auto-dismiss
Position:       top-right, 16px from edges, stacked with 8px gap
Animation:      slide-in from right, fade out
```

---

## 13. PAGE LAYOUT PATTERNS

### 13.1 Dashboard Layout

```
[Topbar]
[Sidebar] | [Portfolio Hero — full width]
          | [Performance Chart] [Portfolio Health + Risk Score]
          | [Watchlist] [Market Movers] [Market Brief]
          | [AI Insights Panel]
          | [Latest News (3 cols)]
```

### 13.2 Stock Detail Layout

```
[Topbar]
[Sidebar] | [Stock Header: Ticker | Name | Price | Change | Status | Actions]
          | [Chart — 70% width]   [Stats Panel — 30% width]
          | [AI Summary card]
          | [News (Left 60%)]     [Sentiment (Right 40%)]
          | [Historical Data Table — full width]
```

### 13.3 Analytics Layout

```
[Topbar]
[Sidebar] | [Portfolio Selector + Date Range + Benchmark controls]
          | [4-metric summary bar: Return | Sharpe | MaxDD | VaR]
          | [Performance Chart — full width]
          | [Risk Metrics (Left)] [Rolling Returns (Right)]
          | [Correlation Heatmap]
          | [AI Analysis card — full width]
```

### 13.4 Strategy Builder Layout

```
[Topbar]
[Sidebar] | [Strategy Name + Tags + Status row]
          | [Rule Builder Canvas (Left 60%)] [Indicator Panel (Right 40%)]
          | [Strategy Library sidebar — collapsible]
          | [AI Strategy Assistant — bottom drawer]
```

---

## 14. RESPONSIVE DESIGN

### 14.1 Breakpoints

```css
--bp-sm:  640px;   /* Small mobile landscape */
--bp-md:  768px;   /* Tablet portrait */
--bp-lg:  1024px;  /* Tablet landscape / small desktop */
--bp-xl:  1280px;  /* Standard desktop */
--bp-2xl: 1536px;  /* Large desktop */
```

### 14.2 Responsive Behavior

| Component | Mobile (<768px) | Tablet (768-1024px) | Desktop (>1024px) |
|---|---|---|---|
| Sidebar | Hidden, bottom nav | Collapsed (icons only) | Full (240px) |
| Dashboard grid | 1 col | 2 col | 12-col |
| Charts | Full width, reduced height | Full width | With sidebar |
| Tables | Horizontal scroll | Horizontal scroll | Full |
| Stock page | Stacked | Stacked | Side-by-side |
| AI Panel | Full-screen sheet | 480px drawer | Inline card |
| Portfolio Hero | Compact, 2-row layout | Full | Full |

### 14.3 Mobile-Specific Components

```
Bottom Navigation Bar (60px)
  Icons: Home, Markets, Portfolio, AI, Menu
  Active: color-ai with label
  Inactive: text-muted, icon only

Mobile Chart Controls
  Time range: horizontal scrollable pill row
  Indicators: tap to toggle sheet

Touch Targets
  Minimum: 44x44px for all interactive elements
  Table rows: tap to navigate to detail
  Swipe: left on watchlist row to delete
```

---

## 15. ACCESSIBILITY STANDARDS

### 15.1 Keyboard Navigation

```
Tab:              Move focus forward through interactive elements
Shift+Tab:        Move focus backward
Enter/Space:      Activate buttons, links, checkboxes
Escape:           Close modals, dropdowns, sheets
Arrow keys:       Navigate within menus, tables, date pickers
Home/End:         First/last item in lists
Page Up/Down:     Scroll, paginate tables
```

### 15.2 ARIA Requirements

```tsx
// Every icon-only button:
<button aria-label="Add to watchlist">
  <Star size={16} />
</button>

// Chart containers:
<div role="img" aria-label="Portfolio performance chart showing 12.4% return over 6 months">

// Live price data (updates):
<div aria-live="polite" aria-atomic="true">
  {price}
</div>

// Loading indicators:
<div role="status" aria-label="Loading portfolio data">
  <SkeletonDashboard />
</div>

// Modals:
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">

// Tables:
<table role="table">
  <thead><tr><th scope="col">Ticker</th></tr></thead>
```

### 15.3 Focus Management

```
Modals: trap focus inside on open, return to trigger on close
Dropdowns: first item focused on open
Forms: first error field focused on submit failure
Route change: focus on main heading or main content area
```

---

## 16. DARK MODE

QuantEdge is **dark-mode first**. Light mode is not planned for v1.

All color tokens are designed for dark mode. No light/dark conditional logic needed.

If light mode is introduced in v2:
- Define `[data-theme="light"]` CSS variable overrides
- Never hardcode hex values in components — always use CSS variables

---

## 17. UI PATTERNS — MODULE BY MODULE

### 17.1 Portfolio Hero Widget

```
┌─────────────────────────────────────────────────────────────┐
│  PORTFOLIO VALUE                     [Portfolio Selector ▼] │
│                                                             │
│  $124,580.42                         ↑ $1,247.82 today     │
│                                      +1.01%  ↑ GAIN        │
│                                                             │
│  All-time Return          Risk Score        Health Score    │
│  +24.58%  ↑               7.2 / 10  ●       82 / 100  ●   │
│                                                             │
│  [1D] [1W] [1M] [3M] [1Y] [All]                            │
│  ──────────────────────────────────────────────────────     │
│  [Performance Chart Area — TradingView area chart]          │
└─────────────────────────────────────────────────────────────┘
```

### 17.2 AI Insights Panel

```
┌─────────────────────────────────────────────────────────────┐
│  🤖  AI ANALYST                                   [Refresh] │
│  ─────────────────────────────────────────────────────────  │
│  Your portfolio shows moderate concentration risk with      │
│  42% in technology. Consider diversifying into healthcare   │
│  or consumer staples to reduce sector correlation...        │
│                                                    [More ›] │
│                                                             │
│  ○ Portfolio Health  ○ Risk Analysis  ○ Strategy Review    │
└─────────────────────────────────────────────────────────────┘
```

### 17.3 Market Movers Widget

```
┌────────────────────────────────┐
│  MARKET MOVERS       [Gainers] [Losers] [Active] │
│  ────────────────────────────────────────────── │
│  ↑ NVDA  +8.24%   $892.40   ████████           │
│  ↑ TSLA  +5.11%   $248.90   ████               │
│  ↑ META  +3.87%   $520.10   ███                │
│  ──────────────────────────────────────────── │
│  ↓ INTC  -4.21%   $29.80                       │
│  ↓ PFE   -2.98%   $27.40                       │
└────────────────────────────────┘
```

### 17.4 Backtest Results Layout

```
┌─────────────────────────────────────────────────────────────┐
│  BACKTEST: SMA Crossover Strategy          [Run New] [Save] │
│  AAPL · Jan 2020 – Dec 2024 · $10,000 initial              │
├─────────────────────────────────────────────────────────────┤
│  Total Return   CAGR    Max DD    Sharpe   Win Rate Trades  │
│  +124.8%        17.6%   -18.2%    1.24     58.2%   142     │
├─────────────────────────────────────────────────────────────┤
│  [Equity Curve vs Buy & Hold — Area Chart]                  │
├─────────────────────────────────────────────────────────────┤
│  🤖 AI Interpretation (streaming)                           │
│  "This strategy outperformed buy-and-hold by 42.3%..."     │
├─────────────────────────────────────────────────────────────┤
│  TRADE LOG                              [Download CSV]      │
│  Entry Date | Exit Date | Entry $ | Exit $ | P&L   | Type  │
│  ──────────────────────────────────────────────────────   │
└─────────────────────────────────────────────────────────────┘
```

---

*End of QuantEdge Design System v1.0.0*
*Next: See TECH_SPEC.md for technical specifications and APPFLOW.md for interaction flows*

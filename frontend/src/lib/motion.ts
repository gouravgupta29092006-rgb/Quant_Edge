/**
 * QuantEdge Motion System
 * Shared Framer Motion variants, springs, and transitions.
 * Import from any component — never define motion values inline.
 */

import type { Variants, Transition } from 'framer-motion';

// ── Springs ─────────────────────────────────────────────────────────────────

export const springs = {
  /** Snappy UI response (buttons, toggles) */
  snappy: { type: 'spring', stiffness: 500, damping: 30, mass: 1 } as Transition,
  /** Card lift, hover elevations */
  lift:   { type: 'spring', stiffness: 300, damping: 24, mass: 0.8 } as Transition,
  /** Number counter updates */
  counter:{ type: 'spring', stiffness: 200, damping: 20, mass: 1 } as Transition,
  /** Page transitions */
  page:   { type: 'spring', stiffness: 260, damping: 28, mass: 1 } as Transition,
  /** Smooth but not bouncy */
  smooth: { type: 'spring', stiffness: 180, damping: 26, mass: 1 } as Transition,
} as const;

// ── Easings ─────────────────────────────────────────────────────────────────

export const ease = {
  out:   [0.16, 1, 0.3, 1]     as [number,number,number,number],
  in:    [0.7, 0, 0.84, 0]     as [number,number,number,number],
  inOut: [0.45, 0, 0.55, 1]   as [number,number,number,number],
  expo:  [0.22, 1, 0.36, 1]   as [number,number,number,number],
} as const;

// ── Page Variants ────────────────────────────────────────────────────────────

export const pageVariants: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: ease.out, staggerChildren: 0.07, delayChildren: 0.05 },
  },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: ease.in } },
};

// ── Card Variants ────────────────────────────────────────────────────────────

export const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: ease.out },
  },
};

export const cardHover = {
  y:     -3,
  scale: 1.01,
  transition: springs.lift,
};

export const cardTap = {
  scale: 0.98,
  transition: springs.snappy,
};

// ── List / Stagger Variants ──────────────────────────────────────────────────

export const listContainerVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.1 },
  },
};

export const listItemVariants: Variants = {
  hidden:  { opacity: 0, x: -10 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.3, ease: ease.out },
  },
};

export const tableRowVariants: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.28, ease: ease.out },
  },
};

// ── Modal / Overlay Variants ─────────────────────────────────────────────────

export const backdropVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15, delay: 0.05 } },
};

export const modalVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.94, y: 16 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.35, ease: ease.out },
  },
  exit:    {
    opacity: 0, scale: 0.96, y: 8,
    transition: { duration: 0.2, ease: ease.in },
  },
};

// ── Sidebar Variants ─────────────────────────────────────────────────────────

export const sidebarItemVariants: Variants = {
  hidden:  { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: ease.out },
  }),
};

// ── Fade Variants ────────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: ease.out } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

export const fadeInUp: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: ease.out } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.2 } },
};

// ── Scale In (for badges, tags, tooltips) ────────────────────────────────────

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.22, ease: ease.out },
  },
  exit:    { opacity: 0, scale: 0.92, transition: { duration: 0.15 } },
};

// ── Number Counter Transition ────────────────────────────────────────────────

export const numberTransition: Transition = {
  ...springs.counter,
};

// ── Button press config ──────────────────────────────────────────────────────

export const buttonHoverTap = {
  whileHover: { scale: 1.02, transition: springs.snappy },
  whileTap:   { scale: 0.96, transition: springs.snappy },
} as const;

// ── Reduced motion fallback ──────────────────────────────────────────────────

export const reducedMotionVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
};

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { scaleIn } from '@/lib/motion';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'brand' | 'accent' | 'neutral' | 'gold';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
  animate?: boolean;
}

const variantMap: Record<BadgeVariant, string> = {
  success: 'badge-success',
  danger:  'badge-danger',
  warning: 'badge-warning',
  brand:   'badge-brand',
  accent:  'badge-accent',
  neutral: 'badge-neutral',
  gold:    'badge bg-warning/10 text-warning border border-warning/20',
};

const dotColor: Record<BadgeVariant, string> = {
  success: 'bg-success',
  danger:  'bg-danger',
  warning: 'bg-warning',
  brand:   'bg-brand-400',
  accent:  'bg-accent',
  neutral: 'bg-text-muted',
  gold:    'bg-gold',
};

export function Badge({ children, variant = 'neutral', className, dot = false, animate: doAnimate = false }: BadgeProps) {
  const shouldReduce = useReducedMotion();
  const cls = cn('badge', variantMap[variant], className);

  const inner = (
    <>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColor[variant])} />}
      {children}
    </>
  );

  if (!doAnimate || shouldReduce) return <span className={cls}>{inner}</span>;

  return (
    <motion.span
      className={cls}
      variants={scaleIn}
      initial="hidden"
      animate="visible"
    >
      {inner}
    </motion.span>
  );
}

/** Up/Down change badge for percent values */
export function ChangeBadge({ value, className }: { value: number; className?: string }) {
  const isPos = value >= 0;
  return (
    <Badge variant={isPos ? 'success' : 'danger'} className={cn('font-mono tabular-nums', className)}>
      {isPos ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </Badge>
  );
}

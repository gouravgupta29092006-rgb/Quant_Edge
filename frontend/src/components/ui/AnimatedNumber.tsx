'use client';

import { useRef, useEffect } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const defaultFormat = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 2 });

/**
 * Spring-animates a number when its value changes.
 * Respects prefers-reduced-motion.
 */
export function AnimatedNumber({
  value,
  format = defaultFormat,
  className,
  duration = 0.8,
  prefix = '',
  suffix = '',
}: AnimatedNumberProps) {
  const ref    = useRef<HTMLSpanElement>(null);
  const prevRef = useRef<number>(value);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;
    const from = prevRef.current;
    const to   = value;
    prevRef.current = to;

    if (shouldReduce || from === to) {
      ref.current.textContent = prefix + format(to) + suffix;
      return;
    }

    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = prefix + format(v) + suffix;
      },
    });
    return () => controls.stop();
  }, [value, format, duration, prefix, suffix, shouldReduce]);

  return (
    <span
      ref={ref}
      className={cn('tabular-nums font-mono', className)}
    >
      {prefix + format(value) + suffix}
    </span>
  );
}

/** Animated percent change with colored badge */
export function AnimatedChange({ value, className }: { value: number; className?: string }) {
  const isPos = value >= 0;
  const abs   = Math.abs(value);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md tabular-nums font-mono',
        isPos
          ? 'bg-success-bg text-success'
          : 'bg-danger-bg text-danger',
        className,
      )}
    >
      {isPos ? '▲' : '▼'}
      <AnimatedNumber value={abs} format={(n) => n.toFixed(2)} suffix="%" />
    </span>
  );
}

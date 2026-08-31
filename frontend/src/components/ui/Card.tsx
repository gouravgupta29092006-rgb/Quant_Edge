'use client';

import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardVariants, cardHover, cardTap } from '@/lib/motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  glass?: boolean;
  variant?: 'default' | 'elevated' | 'ghost';
  animate?: boolean;
  delay?: number;
}

/**
 * Premium motion card. Lift-on-hover with spring, optional glow border.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, hover = true, glow = false, glass = false, variant = 'default', animate: doAnimate = true, delay = 0, ...props }, ref) => {
    const shouldReduce = useReducedMotion();

    const baseClass = cn(
      variant === 'default'  && 'card',
      variant === 'elevated' && 'card shadow-card-lg',
      variant === 'ghost'    && 'rounded-xl p-6',
      glass && 'card-glass',
      glow  && 'border-brand/20 shadow-glow-brand',
      className,
    );

    if (!doAnimate || shouldReduce) {
      return <div ref={ref} className={baseClass} {...props}>{children}</div>;
    }

    return (
      <motion.div
        ref={ref as React.Ref<HTMLDivElement>}
        className={baseClass}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay }}
        whileHover={hover ? cardHover : undefined}
        whileTap={hover ? cardTap : undefined}
        {...(props as React.ComponentProps<typeof motion.div>)}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = 'Card';

/** Static card that animates in but doesn't hover */
export function StaticCard({ children, className, delay = 0, ...props }: CardProps) {
  return (
    <Card hover={false} animate delay={delay} className={className} {...props}>
      {children}
    </Card>
  );
}

'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { pageVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  /** Unique key triggers AnimatePresence re-animation on route change */
  pageKey?: string;
}

/**
 * Wraps every dashboard page with:
 * - AnimatePresence for exit animations
 * - Staggered children entrance via pageVariants
 * - Respects prefers-reduced-motion
 */
export function PageWrapper({ children, className, pageKey }: PageWrapperProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return (
      <div className={cn('page-wrapper', className)}>
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        className={cn('page-wrapper', className)}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** Section within a page — animates as a child of PageWrapper stagger */
export function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      className={cn(className)}
      variants={{
        hidden:  { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      {children}
    </motion.section>
  );
}

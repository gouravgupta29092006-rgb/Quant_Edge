'use client';

import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { buttonHoverTap, springs } from '@/lib/motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize    = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
  success:   'btn-success',
};

const sizeClass: Record<ButtonSize, string> = {
  sm:   'btn-sm',
  md:   '',
  lg:   'btn-lg',
  icon: 'btn-icon',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children, className, variant = 'primary', size = 'md',
    loading = false, leftIcon, rightIcon, disabled, ...props
  }, ref) => {
    const shouldReduce = useReducedMotion();

    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cn(variantClass[variant], sizeClass[size], className)}
        disabled={disabled || loading}
        whileHover={!disabled && !loading && !shouldReduce ? { scale: 1.02, y: -1, transition: springs.snappy } : undefined}
        whileTap={!disabled && !loading && !shouldReduce ? { scale: 0.96, transition: springs.snappy } : undefined}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading ? (
          <motion.span
            className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : leftIcon}
        {children && <span>{children}</span>}
        {!loading && rightIcon}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

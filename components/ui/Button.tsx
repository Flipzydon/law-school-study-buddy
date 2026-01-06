'use client'

import React, { forwardRef, ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-display font-bold transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden',
  {
    variants: {
      variant: {
        // Primary "Power Button" style
        primary:
          'bg-primary text-white border-2 border-ink shadow-[4px_4px_0px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1A1A1A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus:ring-primary disabled:bg-ink-lighter disabled:border-ink-lighter disabled:shadow-none',
        // Nigerian variant (same as primary for backward compatibility)
        nigerian:
          'bg-primary text-white border-2 border-ink shadow-[4px_4px_0px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1A1A1A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus:ring-primary',
        // Volt button (accent color)
        volt:
          'bg-accent text-ink border-2 border-ink shadow-[4px_4px_0px_0px_#1A1A1A] hover:bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1A1A1A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus:ring-accent',
        // Secondary with border
        secondary:
          'bg-white text-primary border-2 border-ink shadow-[4px_4px_0px_0px_#1A1A1A] hover:bg-primary-50 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1A1A1A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus:ring-primary dark:bg-dark-800 dark:text-primary-400',
        // Outline variant
        outline:
          'bg-transparent text-ink border-2 border-ink shadow-[4px_4px_0px_0px_#1A1A1A] hover:bg-paper-dark hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1A1A1A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus:ring-ink dark:text-slate-300 dark:border-slate-600 dark:hover:bg-dark-800',
        // Ghost (no shadow, minimal)
        ghost:
          'text-ink hover:bg-paper-dark focus:ring-ink/30 dark:text-slate-300 dark:hover:bg-dark-800',
        // Danger
        danger:
          'bg-danger text-white border-2 border-ink shadow-[4px_4px_0px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1A1A1A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus:ring-danger',
        // Success
        success:
          'bg-accent text-ink border-2 border-ink shadow-[4px_4px_0px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1A1A1A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus:ring-accent',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 py-3 text-base',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// Animated button using framer-motion
interface MotionButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string
  isLoading?: boolean
  disabled?: boolean
  children?: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function MotionButton({
  className,
  variant,
  size,
  isLoading,
  children,
  disabled,
  onClick,
  type = 'button',
}: MotionButtonProps) {
  return (
    <motion.button
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {isLoading && (
        <motion.svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </motion.svg>
      )}
      {children}
    </motion.button>
  )
}

export { Button, buttonVariants }

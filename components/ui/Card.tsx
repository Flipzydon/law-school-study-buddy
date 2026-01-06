'use client'

import React, { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const cardVariants = cva(
  'rounded-xl transition-all duration-200',
  {
    variants: {
      variant: {
        // Default card with hard shadow
        default:
          'bg-white dark:bg-dark-800 border-2 border-ink dark:border-slate-700 shadow-hard dark:shadow-glass-dark',
        // Glass card with backdrop blur
        glass:
          'bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border-2 border-ink dark:border-white/10 shadow-hard dark:shadow-glass-dark',
        // Dossier card - content container
        dossier:
          'bg-white dark:bg-dark-800 border-2 border-ink dark:border-slate-700 shadow-[6px_6px_0px_0px_#1A1A1A] dark:shadow-[6px_6px_0px_0px_#5D3FD3]',
        // Elevated with hover effect
        elevated:
          'bg-white dark:bg-dark-800 border-2 border-ink dark:border-slate-700 shadow-hard hover:shadow-hard-lg hover:-translate-y-1 hover:-translate-x-1',
        // Outline variant
        outline:
          'border-2 border-ink dark:border-slate-700 bg-transparent',
        // Primary colored card
        primary:
          'bg-primary text-white border-2 border-ink shadow-hard',
        // Accent colored card
        accent:
          'bg-accent text-ink border-2 border-ink shadow-hard',
        // Nigerian variant (mapped to primary for compatibility)
        nigerian:
          'bg-primary text-white border-2 border-ink shadow-hard',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
)

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

// Motion card with animations
interface MotionCardProps extends VariantProps<typeof cardVariants> {
  className?: string
  children?: React.ReactNode
}

export function MotionCard({ className, variant, padding, children }: MotionCardProps) {
  return (
    <motion.div
      className={cn(cardVariants({ variant, padding, className }))}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// Card subcomponents
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-display text-2xl font-bold text-ink dark:text-slate-100', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('font-body text-base text-ink-light dark:text-slate-400 leading-relaxed', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

// Tag/Label component for cards
interface CardTagProps extends HTMLAttributes<HTMLSpanElement> {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

const CardTag = forwardRef<HTMLSpanElement, CardTagProps>(
  ({ className, position = 'top-right', ...props }, ref) => {
    const positionClasses = {
      'top-right': '-top-3 -right-2 -rotate-2',
      'top-left': '-top-3 -left-2 rotate-2',
      'bottom-right': '-bottom-3 -right-2 rotate-2',
      'bottom-left': '-bottom-3 -left-2 -rotate-2',
    }
    return (
      <span
        ref={ref}
        className={cn(
          'absolute px-3 py-1 rounded-lg',
          'bg-accent border-2 border-ink',
          'font-mono text-xs font-bold uppercase tracking-widest text-ink',
          positionClasses[position],
          className
        )}
        {...props}
      />
    )
  }
)
CardTag.displayName = 'CardTag'

export { Card, cardVariants, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardTag }

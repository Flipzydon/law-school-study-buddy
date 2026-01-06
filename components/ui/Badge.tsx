'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-slate-100 text-slate-700 dark:bg-dark-700 dark:text-slate-300',
        primary:
          'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
        nigerian:
          'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
        success:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        warning:
          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        danger:
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        info:
          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        outline:
          'border border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

// Difficulty badge with specific styling
interface DifficultyBadgeProps {
  difficulty: string
  className?: string
}

const DifficultyBadge = ({ difficulty, className }: DifficultyBadgeProps) => {
  const config: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default'; icon: JSX.Element }> = {
    basic: {
      label: 'Basic',
      variant: 'success',
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
    },
    easy: {
      label: 'Easy',
      variant: 'success',
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
    },
    intermediate: {
      label: 'Intermediate',
      variant: 'warning',
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="8" cy="12" r="3" />
          <circle cx="16" cy="12" r="3" />
        </svg>
      ),
    },
    medium: {
      label: 'Medium',
      variant: 'warning',
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="8" cy="12" r="3" />
          <circle cx="16" cy="12" r="3" />
        </svg>
      ),
    },
    advanced: {
      label: 'Advanced',
      variant: 'danger',
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="12" cy="12" r="2.5" />
          <circle cx="18" cy="12" r="2.5" />
        </svg>
      ),
    },
    hard: {
      label: 'Hard',
      variant: 'danger',
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="12" cy="12" r="2.5" />
          <circle cx="18" cy="12" r="2.5" />
        </svg>
      ),
    },
  }

  // Fallback to default if difficulty not found
  const difficultyConfig = config[difficulty.toLowerCase()] || {
    label: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
    variant: 'default' as const,
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  }

  const { label, variant, icon } = difficultyConfig

  return (
    <Badge variant={variant} className={className}>
      {icon}
      {label}
    </Badge>
  )
}

// Score badge with color based on percentage
interface ScoreBadgeProps {
  score: number
  total: number
  className?: string
}

const ScoreBadge = ({ score, total, className }: ScoreBadgeProps) => {
  const percentage = (score / total) * 100
  let variant: 'success' | 'warning' | 'danger' = 'success'

  if (percentage < 50) {
    variant = 'danger'
  } else if (percentage < 70) {
    variant = 'warning'
  }

  return (
    <Badge variant={variant} size="lg" className={className}>
      {score}/{total}
    </Badge>
  )
}

export { Badge, badgeVariants, DifficultyBadge, ScoreBadge }

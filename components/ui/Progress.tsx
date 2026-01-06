'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
  variant?: 'default' | 'nigerian' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, showLabel = false, variant = 'default', size = 'md', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const sizeClasses = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    }

    const variantClasses = {
      default: 'bg-primary-500',
      nigerian: 'bg-nigerian-500',
      gradient: 'bg-gradient-to-r from-nigerian-500 via-nigerian-400 to-primary-500',
    }

    return (
      <div className={cn('w-full', className)} ref={ref} {...props}>
        {showLabel && (
          <div className="flex justify-between mb-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Progress
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div
          className={cn(
            'w-full bg-slate-200 dark:bg-dark-700 rounded-full overflow-hidden',
            sizeClasses[size]
          )}
        >
          <motion.div
            className={cn('h-full rounded-full', variantClasses[variant])}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = 'Progress'

// Circular progress indicator
interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  showValue?: boolean
  className?: string
}

const CircularProgress = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  showValue = true,
  className,
}: CircularProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-dark-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-primary-500"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showValue && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
        </motion.div>
      )}
    </div>
  )
}

export { Progress, CircularProgress }

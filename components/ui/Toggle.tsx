'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean
  onChange: (checked: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'nigerian'
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, checked, onChange, size = 'md', variant = 'default', disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
      md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
      lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
    }

    const variantClasses = {
      default: checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-dark-600',
      nigerian: checked ? 'bg-nigerian-500' : 'bg-slate-300 dark:bg-dark-600',
    }

    const { track, thumb, translate } = sizeClasses[size]

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        ref={ref}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900',
          'disabled:cursor-not-allowed disabled:opacity-50',
          track,
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <motion.span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-transform',
            thumb
          )}
          animate={{
            x: checked ? parseInt(translate.replace('translate-x-', '')) * 4 : 0,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ marginTop: '0.125rem', marginLeft: '0.125rem' }}
        />
      </button>
    )
  }
)
Toggle.displayName = 'Toggle'

// Theme toggle with sun/moon icons
interface ThemeToggleProps {
  isDark: boolean
  onChange: (isDark: boolean) => void
  className?: string
}

const ThemeToggle = ({ isDark, onChange, className }: ThemeToggleProps) => {
  return (
    <button
      onClick={() => onChange(!isDark)}
      className={cn(
        'relative p-2 rounded-xl transition-colors duration-200',
        'bg-slate-100 dark:bg-dark-700 hover:bg-slate-200 dark:hover:bg-dark-600',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon */}
        <motion.svg
          className="absolute inset-0 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          initial={false}
          animate={{
            scale: isDark ? 0 : 1,
            rotate: isDark ? -90 : 0,
            opacity: isDark ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </motion.svg>
        {/* Moon icon */}
        <motion.svg
          className="absolute inset-0 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          initial={false}
          animate={{
            scale: isDark ? 1 : 0,
            rotate: isDark ? 0 : 90,
            opacity: isDark ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </motion.svg>
      </div>
    </button>
  )
}

export { Toggle, ThemeToggle }

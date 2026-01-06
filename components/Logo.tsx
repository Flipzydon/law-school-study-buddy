'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface LogoProps {
  variant?: 'full' | 'icon' | 'wordmark'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
}

const sizeConfig = {
  sm: { icon: 24, text: 'text-lg', gap: 'gap-1.5' },
  md: { icon: 32, text: 'text-xl', gap: 'gap-2' },
  lg: { icon: 40, text: 'text-2xl', gap: 'gap-2.5' },
  xl: { icon: 56, text: 'text-3xl', gap: 'gap-3' },
}

// Scales of Justice SVG icon with Nigerian green
const ScalesIcon = ({ size, animated }: { size: number; animated?: boolean }) => {
  const Icon = animated ? motion.svg : 'svg'
  const animationProps = animated
    ? {
        initial: { rotate: -5 },
        animate: { rotate: [0, -2, 2, 0] },
        transition: { duration: 2, repeat: Infinity, repeatDelay: 3 },
      }
    : {}

  return (
    <Icon
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...animationProps}
    >
      {/* Base/Stand */}
      <path
        d="M20 44H28V40H26V34H22V40H20V44Z"
        fill="currentColor"
        className="text-nigerian-600 dark:text-nigerian-400"
      />
      <path
        d="M16 44H32V42H16V44Z"
        fill="currentColor"
        className="text-nigerian-700 dark:text-nigerian-500"
      />

      {/* Center Pillar */}
      <path
        d="M23 8V34H25V8H23Z"
        fill="currentColor"
        className="text-nigerian-600 dark:text-nigerian-400"
      />

      {/* Top Crown */}
      <path
        d="M24 4L28 8H20L24 4Z"
        fill="currentColor"
        className="text-nigerian-500 dark:text-nigerian-300"
      />

      {/* Balance Beam */}
      <path
        d="M8 12H40V14H8V12Z"
        fill="currentColor"
        className="text-nigerian-600 dark:text-nigerian-400"
      />

      {/* Left Scale Pan */}
      <motion.g
        animate={animated ? { y: [0, 1, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M10 14L6 24H18L14 14H10Z"
          fill="currentColor"
          className="text-nigerian-400 dark:text-nigerian-500"
        />
        <ellipse
          cx="12"
          cy="26"
          rx="7"
          ry="2"
          fill="currentColor"
          className="text-nigerian-500 dark:text-nigerian-400"
        />
        <path
          d="M5 24C5 24 6 28 12 28C18 28 19 24 19 24"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-nigerian-600 dark:text-nigerian-400"
          fill="none"
        />
      </motion.g>

      {/* Right Scale Pan */}
      <motion.g
        animate={animated ? { y: [0, -1, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M34 14L30 24H42L38 14H34Z"
          fill="currentColor"
          className="text-nigerian-400 dark:text-nigerian-500"
        />
        <ellipse
          cx="36"
          cy="26"
          rx="7"
          ry="2"
          fill="currentColor"
          className="text-nigerian-500 dark:text-nigerian-400"
        />
        <path
          d="M29 24C29 24 30 28 36 28C42 28 43 24 43 24"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-nigerian-600 dark:text-nigerian-400"
          fill="none"
        />
      </motion.g>

      {/* Chains/Strings */}
      <path
        d="M10 14V12M14 14V12M34 14V12M38 14V12"
        stroke="currentColor"
        strokeWidth="1"
        className="text-nigerian-500 dark:text-nigerian-400"
      />
    </Icon>
  )
}

// Wordmark text
const Wordmark = ({ size, className }: { size: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) => {
  return (
    <div className={cn('flex flex-col leading-tight', className)}>
      <span
        className={cn(
          'font-bold tracking-tight text-slate-900 dark:text-white',
          sizeConfig[size].text
        )}
      >
        Law Study
      </span>
      <span
        className={cn(
          'font-semibold tracking-wide text-nigerian-600 dark:text-nigerian-400',
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-lg'
        )}
      >
        BUDDY
      </span>
    </div>
  )
}

export function Logo({ variant = 'full', size = 'md', animated = false, className }: LogoProps) {
  const { icon, gap } = sizeConfig[size]

  if (variant === 'icon') {
    return (
      <div className={className}>
        <ScalesIcon size={icon} animated={animated} />
      </div>
    )
  }

  if (variant === 'wordmark') {
    return <Wordmark size={size} className={className} />
  }

  return (
    <div className={cn('flex items-center', gap, className)}>
      <ScalesIcon size={icon} animated={animated} />
      <Wordmark size={size} />
    </div>
  )
}

// Compact logo for mobile/small spaces
export function LogoCompact({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <ScalesIcon size={24} />
      <span className="font-bold text-slate-900 dark:text-white">LSB</span>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Toggle } from './ui/Toggle'
import { Badge } from './ui/Badge'
import { cn } from '@/lib/utils'
import type { QuizConfig } from '@/types/quiz'

interface QuizConfigProps {
  config: QuizConfig
  onChange: (config: QuizConfig) => void
  disabled?: boolean
}

const QUESTION_COUNTS = [5, 10, 15, 20] as const
const DIFFICULTIES = [
  {
    value: 'basic' as const,
    label: 'Basic',
    description: 'Fundamental concepts',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    color: 'text-accent-700 dark:text-accent-400',
    bgColor: 'bg-accent/20 dark:bg-accent/10',
    borderColor: 'border-accent',
  },
  {
    value: 'intermediate' as const,
    label: 'Intermediate',
    description: 'Application & analysis',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="8" cy="12" r="3" />
        <circle cx="16" cy="12" r="3" />
      </svg>
    ),
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/20',
    borderColor: 'border-amber-500',
  },
  {
    value: 'advanced' as const,
    label: 'Advanced',
    description: 'Critical thinking',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="12" cy="12" r="2.5" />
        <circle cx="18" cy="12" r="2.5" />
      </svg>
    ),
    color: 'text-danger dark:text-red-400',
    bgColor: 'bg-danger/10 dark:bg-red-900/20',
    borderColor: 'border-danger',
  },
]

export function QuizConfig({ config, onChange, disabled }: QuizConfigProps) {
  const updateConfig = (updates: Partial<QuizConfig>) => {
    onChange({ ...config, ...updates })
  }

  return (
    <div className="space-y-6">
      {/* Question Count */}
      <div>
        <label className="block font-mono text-xs font-bold uppercase tracking-widest text-ink dark:text-slate-300 mb-3">
          Number of Questions
        </label>
        <div className="flex gap-2">
          {QUESTION_COUNTS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => updateConfig({ questionCount: count })}
              disabled={disabled}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl font-display font-bold text-lg transition-all',
                'border-2 focus:outline-none focus:ring-2 focus:ring-primary',
                config.questionCount === count
                  ? 'border-primary bg-primary text-white shadow-hard-sm'
                  : 'border-ink/20 dark:border-slate-700 text-ink dark:text-slate-400 hover:border-primary/50 bg-white dark:bg-dark-800',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Level */}
      <div>
        <label className="block font-mono text-xs font-bold uppercase tracking-widest text-ink dark:text-slate-300 mb-3">
          Difficulty Level
        </label>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTIES.map((difficulty) => (
            <button
              key={difficulty.value}
              type="button"
              onClick={() => updateConfig({ difficulty: difficulty.value })}
              disabled={disabled}
              className={cn(
                'p-4 rounded-xl border-2 transition-all text-left',
                'focus:outline-none focus:ring-2 focus:ring-primary',
                config.difficulty === difficulty.value
                  ? `${difficulty.borderColor} ${difficulty.bgColor} shadow-hard-sm`
                  : 'border-ink/20 dark:border-slate-700 hover:border-primary/50 bg-white dark:bg-dark-800',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className={cn('mb-2', difficulty.color)}>{difficulty.icon}</div>
              <div className="font-display font-bold text-ink dark:text-white text-sm">
                {difficulty.label}
              </div>
              <div className="text-xs font-body text-ink-light dark:text-slate-400 mt-1">
                {difficulty.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Mode */}
      <div>
        <label className="block font-mono text-xs font-bold uppercase tracking-widest text-ink dark:text-slate-300 mb-3">
          Quiz Mode
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateConfig({ mode: 'practice' })}
            disabled={disabled}
            className={cn(
              'p-4 rounded-xl border-2 transition-all text-left',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              config.mode === 'practice'
                ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-hard-sm'
                : 'border-ink/20 dark:border-slate-700 hover:border-primary/50 bg-white dark:bg-dark-800',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg
                className={cn(
                  'w-5 h-5',
                  config.mode === 'practice' ? 'text-primary' : 'text-ink-light dark:text-slate-400'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span className="font-display font-bold text-ink dark:text-white">Practice</span>
            </div>
            <p className="text-xs font-body text-ink-light dark:text-slate-400">
              Instant feedback after each answer
            </p>
          </button>

          <button
            type="button"
            onClick={() => updateConfig({ mode: 'exam' })}
            disabled={disabled}
            className={cn(
              'p-4 rounded-xl border-2 transition-all text-left',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              config.mode === 'exam'
                ? 'border-accent bg-accent/20 dark:bg-accent/10 shadow-hard-sm'
                : 'border-ink/20 dark:border-slate-700 hover:border-primary/50 bg-white dark:bg-dark-800',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg
                className={cn(
                  'w-5 h-5',
                  config.mode === 'exam' ? 'text-ink' : 'text-ink-light dark:text-slate-400'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="font-display font-bold text-ink dark:text-white">Exam</span>
            </div>
            <p className="text-xs font-body text-ink-light dark:text-slate-400">
              Results only after submitting
            </p>
          </button>
        </div>
      </div>

      {/* Show Explanations Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-paper-dark dark:bg-dark-700 border-2 border-ink/10 dark:border-slate-700">
        <div>
          <div className="font-display font-bold text-ink dark:text-white">Show Explanations</div>
          <div className="text-sm font-body text-ink-light dark:text-slate-400">
            Include detailed answer explanations
          </div>
        </div>
        <Toggle
          checked={config.showExplanations}
          onChange={(checked) => updateConfig({ showExplanations: checked })}
          variant="nigerian"
          disabled={disabled}
        />
      </div>
    </div>
  )
}

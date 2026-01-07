'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Step {
  label: string
  description?: string
}

interface GenerationProgressProps {
  steps: Step[]
  currentStep: number
  type: 'quiz' | 'flashcards' | 'slides' | 'podcast'
}

const typeConfig = {
  quiz: {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
    color: 'primary',
    title: 'Generating Quiz'
  },
  flashcards: {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    ),
    color: 'primary',
    title: 'Generating Flashcards'
  },
  slides: {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    ),
    color: 'primary',
    title: 'Generating Slides'
  },
  podcast: {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    ),
    color: 'accent',
    title: 'Generating Podcast'
  }
}

export function GenerationProgress({ steps, currentStep, type }: GenerationProgressProps) {
  const config = typeConfig[type]
  const progress = Math.min(((currentStep + 1) / steps.length) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 rounded-xl bg-ink dark:bg-dark-800 border-2 border-ink shadow-[4px_4px_0px_0px_#CCFF00]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center border-2 border-ink',
          type === 'podcast' ? 'bg-accent' : 'bg-primary'
        )}>
          <svg className={cn('w-5 h-5', type === 'podcast' ? 'text-ink' : 'text-white')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {config.icon}
          </svg>
        </div>
        <div>
          <h4 className="font-display font-bold text-white">{config.title}</h4>
          <p className="text-xs font-mono text-white/60">Step {currentStep + 1} of {steps.length}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-white/20 rounded-full overflow-hidden mb-4">
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            type === 'podcast' ? 'bg-accent' : 'bg-primary'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {/* Animated shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isComplete = index < currentStep
          const isCurrent = index === currentStep
          const isPending = index > currentStep

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg transition-colors',
                isCurrent && 'bg-white/10'
              )}
            >
              {/* Status Icon */}
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors',
                isComplete && 'bg-accent border-accent',
                isCurrent && 'bg-transparent border-accent',
                isPending && 'bg-transparent border-white/30'
              )}>
                {isComplete ? (
                  <svg className="w-3 h-3 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : isCurrent ? (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-accent"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                )}
              </div>

              {/* Step Label */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-body transition-colors',
                  isComplete && 'text-white/60',
                  isCurrent && 'text-white font-semibold',
                  isPending && 'text-white/40'
                )}>
                  {step.label}
                </p>
                {isCurrent && step.description && (
                  <p className="text-xs text-white/50 font-body">{step.description}</p>
                )}
              </div>

              {/* Spinner for current step */}
              {isCurrent && (
                <motion.svg
                  className="w-4 h-4 text-accent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </motion.svg>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Estimated time */}
      <p className="mt-4 text-xs text-center text-white/40 font-body">
        This usually takes 30-60 seconds
      </p>
    </motion.div>
  )
}

// Predefined step configurations
export const QUIZ_STEPS: Step[] = [
  { label: 'Reading PDF', description: 'Extracting text content...' },
  { label: 'Analyzing content', description: 'Understanding the material...' },
  { label: 'Generating questions', description: 'Creating quiz questions...' },
  { label: 'Finalizing', description: 'Almost done...' },
]

export const FLASHCARD_STEPS: Step[] = [
  { label: 'Reading PDF', description: 'Extracting text content...' },
  { label: 'Identifying key concepts', description: 'Finding important topics...' },
  { label: 'Creating flashcards', description: 'Writing Q&A pairs...' },
  { label: 'Finalizing', description: 'Almost done...' },
]

export const SLIDES_STEPS: Step[] = [
  { label: 'Reading PDF', description: 'Extracting text content...' },
  { label: 'Structuring content', description: 'Organizing information...' },
  { label: 'Creating slides', description: 'Building presentation...' },
  { label: 'Finalizing', description: 'Almost done...' },
]

export const PODCAST_STEPS: Step[] = [
  { label: 'Reading PDF', description: 'Extracting text content...' },
  { label: 'Writing script', description: 'Creating podcast narration...' },
  { label: 'Generating audio', description: 'Converting to speech...' },
  { label: 'Uploading audio', description: 'Saving to storage...' },
  { label: 'Finalizing', description: 'Almost done...' },
]

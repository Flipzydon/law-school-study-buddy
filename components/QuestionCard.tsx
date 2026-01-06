'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DifficultyBadge } from './ui/Badge'
import type { Question } from '@/types/quiz'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedAnswer: number | null
  onSelectAnswer: (index: number) => void
  showFeedback: boolean
  disabled?: boolean
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  showFeedback,
  disabled,
}: QuestionCardProps) {
  const isAnswered = selectedAnswer !== null
  const isCorrect = isAnswered && selectedAnswer === question.correctAnswer

  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Question Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Question {questionNumber} of {totalQuestions}
            </span>
            {question.difficulty && (
              <DifficultyBadge difficulty={question.difficulty} />
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {question.question}
          </h2>
        </div>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index
          const isCorrectOption = index === question.correctAnswer
          const showCorrect = showFeedback && isCorrectOption
          const showIncorrect = showFeedback && isSelected && !isCorrectOption

          return (
            <motion.button
              key={index}
              whileHover={!disabled && !showFeedback ? { scale: 1.01 } : {}}
              whileTap={!disabled && !showFeedback ? { scale: 0.99 } : {}}
              onClick={() => !disabled && !showFeedback && onSelectAnswer(index)}
              disabled={disabled || showFeedback}
              className={cn(
                'w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'dark:focus:ring-offset-dark-900',
                // Default state
                !isSelected && !showFeedback && 'border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-800 hover:border-primary-300 dark:hover:border-primary-600',
                // Selected state (no feedback)
                isSelected && !showFeedback && 'border-primary-500 bg-primary-50 dark:bg-primary-900/20',
                // Correct answer (with feedback)
                showCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/20',
                // Incorrect selected (with feedback)
                showIncorrect && 'border-red-500 bg-red-50 dark:bg-red-900/20',
                // Disabled
                (disabled || showFeedback) && 'cursor-default'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Option indicator */}
                <div
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-colors',
                    !isSelected && !showFeedback && 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400',
                    isSelected && !showFeedback && 'border-primary-500 bg-primary-500 text-white',
                    showCorrect && 'border-green-500 bg-green-500 text-white',
                    showIncorrect && 'border-red-500 bg-red-500 text-white'
                  )}
                >
                  {showCorrect ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : showIncorrect ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </div>

                {/* Option text */}
                <span
                  className={cn(
                    'flex-1 text-base sm:text-lg',
                    showCorrect && 'text-green-800 dark:text-green-300 font-medium',
                    showIncorrect && 'text-red-800 dark:text-red-300',
                    !showFeedback && 'text-slate-700 dark:text-slate-300'
                  )}
                >
                  {option}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Explanation (shown after feedback in practice mode) */}
      <AnimatePresence>
        {showFeedback && question.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                'p-5 rounded-xl border-2',
                isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                  )}
                >
                  <svg
                    className={cn(
                      'w-4 h-4',
                      isCorrect ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4
                    className={cn(
                      'font-semibold mb-1',
                      isCorrect ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300'
                    )}
                  >
                    {isCorrect ? 'Correct!' : 'Explanation'}
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

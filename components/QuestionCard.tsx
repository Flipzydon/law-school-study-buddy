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
            <span className="text-sm font-mono font-bold uppercase tracking-wider text-ink-light dark:text-slate-400">
              Question {questionNumber} of {totalQuestions}
            </span>
            {question.difficulty && (
              <DifficultyBadge difficulty={question.difficulty} />
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-ink dark:text-white leading-relaxed">
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
              whileHover={!disabled && !showFeedback ? { scale: 1.01, x: 4 } : {}}
              whileTap={!disabled && !showFeedback ? { scale: 0.99 } : {}}
              onClick={() => !disabled && !showFeedback && onSelectAnswer(index)}
              disabled={disabled || showFeedback}
              className={cn(
                'w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all font-body',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'dark:focus:ring-offset-dark-900',
                // Default state
                !isSelected && !showFeedback && 'border-ink/20 dark:border-slate-700 bg-white dark:bg-dark-800 hover:border-primary hover:shadow-hard-sm',
                // Selected state (no feedback)
                isSelected && !showFeedback && 'border-primary bg-primary/10 dark:bg-primary/20 shadow-hard-sm',
                // Correct answer (with feedback)
                showCorrect && 'border-accent bg-accent/20 dark:bg-accent/30 shadow-[4px_4px_0px_0px_#CCFF00]',
                // Incorrect selected (with feedback)
                showIncorrect && 'border-danger bg-danger/10 dark:bg-danger/20 shadow-[4px_4px_0px_0px_#FF3366]',
                // Disabled
                (disabled || showFeedback) && 'cursor-default'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Option indicator */}
                <div
                  className={cn(
                    'flex-shrink-0 w-10 h-10 rounded-xl border-2 flex items-center justify-center font-display font-bold text-sm transition-colors',
                    !isSelected && !showFeedback && 'border-ink/30 dark:border-slate-600 text-ink-light dark:text-slate-400 bg-paper-dark dark:bg-dark-700',
                    isSelected && !showFeedback && 'border-primary bg-primary text-white',
                    showCorrect && 'border-ink bg-accent text-ink',
                    showIncorrect && 'border-ink bg-danger text-white'
                  )}
                >
                  {showCorrect ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : showIncorrect ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </div>

                {/* Option text */}
                <span
                  className={cn(
                    'flex-1 text-base sm:text-lg pt-1.5',
                    showCorrect && 'text-ink dark:text-white font-semibold',
                    showIncorrect && 'text-danger dark:text-danger',
                    !showFeedback && 'text-ink dark:text-slate-300'
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
                  ? 'bg-accent/20 border-accent shadow-[4px_4px_0px_0px_#CCFF00]'
                  : 'bg-primary/10 border-primary shadow-[4px_4px_0px_0px_#5D3FD3]'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 border-ink',
                    isCorrect ? 'bg-accent' : 'bg-primary'
                  )}
                >
                  <svg
                    className={cn(
                      'w-5 h-5',
                      isCorrect ? 'text-ink' : 'text-white'
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
                <div className="flex-1">
                  <h4
                    className={cn(
                      'font-display font-bold mb-2 text-lg',
                      isCorrect ? 'text-ink dark:text-white' : 'text-primary dark:text-primary-300'
                    )}
                  >
                    {isCorrect ? 'Correct!' : 'Explanation'}
                  </h4>
                  <p className="text-ink dark:text-slate-300 font-body leading-relaxed">
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

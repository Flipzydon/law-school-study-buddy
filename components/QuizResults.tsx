'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { CircularProgress } from './ui/Progress'
import { Badge, DifficultyBadge } from './ui/Badge'
import { cn } from '@/lib/utils'
import type { Question, QuizConfig } from '@/types/quiz'

interface QuizResultsProps {
  questions: Question[]
  answers: (number | null)[]
  config: QuizConfig
  pdfFilename: string
  timeSpent: number
  onSaveScore: (name: string) => Promise<void>
  onRetakeQuiz: () => void
  onNewQuiz: () => void
}

export function QuizResults({
  questions,
  answers,
  config,
  pdfFilename,
  timeSpent,
  onSaveScore,
  onRetakeQuiz,
  onNewQuiz,
}: QuizResultsProps) {
  const [studentName, setStudentName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  // Calculate score
  const score = questions.reduce((acc, q, index) => {
    return acc + (answers[index] === q.correctAnswer ? 1 : 0)
  }, 0)
  const percentage = Math.round((score / questions.length) * 100)

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSaveScore(studentName)
      setIsSaved(true)
    } finally {
      setIsSaving(false)
    }
  }

  // Get performance message
  const getPerformanceMessage = () => {
    if (percentage >= 90) return { text: 'Outstanding!', emoji: '🏆', color: 'text-green-600' }
    if (percentage >= 70) return { text: 'Great work!', emoji: '🌟', color: 'text-green-500' }
    if (percentage >= 50) return { text: 'Good effort!', emoji: '👍', color: 'text-amber-500' }
    return { text: 'Keep practicing!', emoji: '💪', color: 'text-red-500' }
  }

  const performance = getPerformanceMessage()

  return (
    <div className="min-h-screen bg-gradient-main py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card variant="glass" padding="lg" className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <CircularProgress
                value={percentage}
                size={160}
                strokeWidth={12}
                className="mx-auto"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Quiz Complete!
              </h2>
              <p className={cn('text-xl font-semibold mb-4', performance.color)}>
                {performance.emoji} {performance.text}
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <Badge variant="primary" size="lg">
                  {score} / {questions.length} correct
                </Badge>
                <Badge variant="default" size="lg">
                  {formatTime(timeSpent)} time
                </Badge>
                <Badge
                  variant={config.difficulty === 'basic' ? 'success' : config.difficulty === 'advanced' ? 'danger' : 'warning'}
                  size="lg"
                >
                  {config.difficulty}
                </Badge>
              </div>
            </motion.div>

            {/* Save Score Section */}
            {!isSaved && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6"
              >
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Save your score to track your progress
                </p>
                <div className="flex gap-2 max-w-sm mx-auto">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your name"
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Button
                    variant="nigerian"
                    onClick={handleSave}
                    isLoading={isSaving}
                    disabled={isSaving}
                  >
                    Save
                  </Button>
                </div>
              </motion.div>
            )}

            {isSaved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Score saved!</span>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Question Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card variant="default" padding="md">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Review Your Answers
            </h3>

            <div className="space-y-3">
              {questions.map((q, index) => {
                const isCorrect = answers[index] === q.correctAnswer
                const isExpanded = expandedQuestion === index

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : index)}
                      className={cn(
                        'w-full text-left p-4 rounded-xl border-2 transition-all',
                        isCorrect
                          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                          : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm',
                              isCorrect ? 'bg-green-500' : 'bg-red-500'
                            )}
                          >
                            {isCorrect ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            Question {index + 1}
                          </span>
                        </div>
                        <svg
                          className={cn(
                            'w-5 h-5 text-slate-400 transition-transform',
                            isExpanded && 'rotate-180'
                          )}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"
                        >
                          <p className="text-slate-700 dark:text-slate-300 mb-4">{q.question}</p>

                          <div className="space-y-2 mb-4">
                            {q.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={cn(
                                  'p-3 rounded-lg text-sm',
                                  optIndex === q.correctAnswer && 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium',
                                  optIndex === answers[index] && optIndex !== q.correctAnswer && 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
                                  optIndex !== q.correctAnswer && optIndex !== answers[index] && 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400'
                                )}
                              >
                                <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                                {option}
                                {optIndex === q.correctAnswer && ' ✓'}
                                {optIndex === answers[index] && optIndex !== q.correctAnswer && ' (Your answer)'}
                              </div>
                            ))}
                          </div>

                          {q.explanation && (
                            <div className="p-3 rounded-lg bg-slate-100 dark:bg-dark-700">
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                <span className="font-medium text-slate-900 dark:text-white">Explanation: </span>
                                {q.explanation}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button variant="outline" size="lg" className="flex-1" onClick={onRetakeQuiz}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retake This Quiz
          </Button>
          <Button variant="nigerian" size="lg" className="flex-1" onClick={onNewQuiz}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Quiz
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

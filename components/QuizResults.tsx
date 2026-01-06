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
    if (percentage >= 90) return { text: 'Outstanding!', color: 'text-accent' }
    if (percentage >= 70) return { text: 'Great work!', color: 'text-primary' }
    if (percentage >= 50) return { text: 'Good effort!', color: 'text-primary' }
    return { text: 'Keep practicing!', color: 'text-danger' }
  }

  const performance = getPerformanceMessage()

  return (
    <div className="min-h-screen bg-paper dark:bg-dark-900 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card variant="default" padding="lg" className="text-center border-2 border-ink shadow-hard">
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
              <h2 className="text-3xl font-display font-bold text-ink dark:text-white mb-2">
                Quiz Complete!
              </h2>
              <p className={cn('text-xl font-display font-bold mb-6', performance.color)}>
                {performance.text}
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <span className="px-4 py-2 bg-primary text-white font-mono font-bold rounded-xl border-2 border-ink shadow-hard-sm">
                  {score} / {questions.length} correct
                </span>
                <span className="px-4 py-2 bg-paper-dark dark:bg-dark-700 text-ink dark:text-white font-mono font-bold rounded-xl border-2 border-ink/30">
                  {formatTime(timeSpent)} time
                </span>
                <DifficultyBadge difficulty={config.difficulty} />
              </div>
            </motion.div>

            {/* Save Score Section */}
            {!isSaved && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="border-t-2 border-ink/20 dark:border-slate-700 pt-6 mt-6"
              >
                <p className="text-sm text-ink-light dark:text-slate-400 mb-3 font-body">
                  Save your score to track your progress
                </p>
                <div className="flex gap-2 max-w-sm mx-auto">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your name"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-ink/30 bg-white dark:bg-dark-800 text-ink dark:text-white font-body focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                  <Button
                    variant="volt"
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
                className="flex items-center justify-center gap-2 px-4 py-3 bg-accent/20 rounded-xl border-2 border-accent"
              >
                <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-display font-bold text-ink">Score saved!</span>
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
          <Card variant="default" padding="md" className="border-2 border-ink shadow-hard">
            <h3 className="text-lg font-display font-bold text-ink dark:text-white mb-4">
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
                          ? 'border-accent bg-accent/10 hover:bg-accent/20 shadow-[3px_3px_0px_0px_#CCFF00]'
                          : 'border-danger bg-danger/10 hover:bg-danger/20 shadow-[3px_3px_0px_0px_#FF3366]'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm border-2 border-ink',
                              isCorrect ? 'bg-accent text-ink' : 'bg-danger text-white'
                            )}
                          >
                            {isCorrect ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <span className="font-display font-bold text-ink dark:text-white">
                            Question {index + 1}
                          </span>
                        </div>
                        <motion.svg
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-5 h-5 text-ink-light"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </div>

                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t-2 border-ink/20"
                        >
                          <p className="text-ink dark:text-slate-300 mb-4 font-body">{q.question}</p>

                          <div className="space-y-2 mb-4">
                            {q.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={cn(
                                  'p-3 rounded-xl text-sm font-body border-2',
                                  optIndex === q.correctAnswer && 'bg-accent/30 border-accent text-ink font-semibold',
                                  optIndex === answers[index] && optIndex !== q.correctAnswer && 'bg-danger/20 border-danger text-danger',
                                  optIndex !== q.correctAnswer && optIndex !== answers[index] && 'bg-paper-dark dark:bg-dark-700 border-ink/20 text-ink-light dark:text-slate-400'
                                )}
                              >
                                <span className="font-mono font-bold mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                                {option}
                                {optIndex === q.correctAnswer && ' ✓'}
                                {optIndex === answers[index] && optIndex !== q.correctAnswer && ' (Your answer)'}
                              </div>
                            ))}
                          </div>

                          {q.explanation && (
                            <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary">
                              <p className="text-sm font-body text-ink dark:text-slate-300">
                                <span className="font-display font-bold text-primary">Explanation: </span>
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
            Retake Quiz
          </Button>
          <Button variant="primary" size="lg" className="flex-1" onClick={onNewQuiz}>
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

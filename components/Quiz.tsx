'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Progress } from './ui/Progress'
import { Badge } from './ui/Badge'
import { QuestionCard } from './QuestionCard'
import { QuizResults } from './QuizResults'
import { QuizHeader } from './Header'
import { cn } from '@/lib/utils'
import type { Question, QuizConfig } from '@/types/quiz'

interface QuizProps {
  questions: Question[]
  pdfFilename: string
  config: QuizConfig
  onComplete: () => void
}

export default function Quiz({ questions, pdfFilename, config, onComplete }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  )
  const [showFeedback, setShowFeedback] = useState<boolean[]>(
    new Array(questions.length).fill(false)
  )
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [startTime] = useState(Date.now())
  const [timeSpent, setTimeSpent] = useState(0)
  const [timer, setTimer] = useState<number | null>(config.timeLimit ? config.timeLimit * 60 : null)

  // Timer effect
  useEffect(() => {
    if (isSubmitted || !timer) return

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(interval)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isSubmitted, timer])

  // Calculate time spent when submitted
  useEffect(() => {
    if (isSubmitted) {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }
  }, [isSubmitted, startTime])

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const answeredCount = selectedAnswers.filter((a) => a !== null).length
  const allAnswered = answeredCount === questions.length

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (isSubmitted) return

    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)

    // In practice mode, show feedback immediately
    if (config.mode === 'practice') {
      const newFeedback = [...showFeedback]
      newFeedback[currentQuestionIndex] = true
      setShowFeedback(newFeedback)
    }
  }, [currentQuestionIndex, selectedAnswers, showFeedback, config.mode, isSubmitted])

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const handleSubmit = () => {
    // Show all feedback in exam mode
    if (config.mode === 'exam') {
      setShowFeedback(new Array(questions.length).fill(true))
    }
    setIsSubmitted(true)
  }

  const handleSaveScore = async (name: string) => {
    const score = questions.reduce((acc, q, index) => {
      return acc + (selectedAnswers[index] === q.correctAnswer ? 1 : 0)
    }, 0)
    const percentage = ((score / questions.length) * 100).toFixed(2)

    const response = await fetch('/api/save-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: name || 'Anonymous',
        score,
        totalQuestions: questions.length,
        percentage,
        pdfFilename,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save score')
    }
  }

  const handleRetakeQuiz = () => {
    setSelectedAnswers(new Array(questions.length).fill(null))
    setShowFeedback(new Array(questions.length).fill(false))
    setCurrentQuestionIndex(0)
    setIsSubmitted(false)
    setTimer(config.timeLimit ? config.timeLimit * 60 : null)
  }

  // Show results
  if (isSubmitted) {
    return (
      <QuizResults
        questions={questions}
        answers={selectedAnswers}
        config={config}
        pdfFilename={pdfFilename}
        timeSpent={timeSpent}
        onSaveScore={handleSaveScore}
        onRetakeQuiz={handleRetakeQuiz}
        onNewQuiz={onComplete}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Quiz Header */}
      <QuizHeader
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        timeRemaining={timer ?? undefined}
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Progress
            value={currentQuestionIndex + 1}
            max={questions.length}
            variant="nigerian"
            size="md"
          />
        </motion.div>

        {/* Question Navigator (mini) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {questions.map((_, index) => {
            const isAnswered = selectedAnswers[index] !== null
            const isCurrent = index === currentQuestionIndex
            const hasCorrectFeedback = showFeedback[index] && selectedAnswers[index] === questions[index].correctAnswer
            const hasIncorrectFeedback = showFeedback[index] && selectedAnswers[index] !== questions[index].correctAnswer

            return (
              <button
                key={index}
                onClick={() => handleJumpToQuestion(index)}
                className={cn(
                  'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  isCurrent && 'ring-2 ring-primary-500',
                  hasCorrectFeedback && 'bg-green-500 text-white',
                  hasIncorrectFeedback && 'bg-red-500 text-white',
                  !showFeedback[index] && isAnswered && 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400',
                  !isAnswered && 'bg-slate-100 dark:bg-dark-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-600'
                )}
              >
                {index + 1}
              </button>
            )
          })}
        </motion.div>

        {/* Question Card */}
        <Card variant="glass" padding="lg" className="mb-6">
          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentQuestionIndex}
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              selectedAnswer={selectedAnswers[currentQuestionIndex]}
              onSelectAnswer={handleAnswerSelect}
              showFeedback={showFeedback[currentQuestionIndex]}
              disabled={config.mode === 'exam' && showFeedback[currentQuestionIndex]}
            />
          </AnimatePresence>
        </Card>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between gap-4"
        >
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant="default">
              {answeredCount} / {questions.length} answered
            </Badge>
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              variant="success"
              onClick={handleSubmit}
              disabled={!allAnswered && config.mode === 'exam'}
            >
              {config.mode === 'practice' && !allAnswered ? 'Finish Early' : 'Submit Quiz'}
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </Button>
          ) : config.mode === 'practice' && showFeedback[currentQuestionIndex] ? (
            <Button variant="nigerian" onClick={handleNext}>
              Continue
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestionIndex] === null}
            >
              Next
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          )}
        </motion.div>

        {/* Quick Submit for Practice Mode */}
        {config.mode === 'practice' && allAnswered && currentQuestionIndex !== questions.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center"
          >
            <Button variant="ghost" size="sm" onClick={handleSubmit}>
              All questions answered - Submit now?
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

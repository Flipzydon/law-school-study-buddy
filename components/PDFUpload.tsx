'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { QuizConfig } from './QuizConfig'
import { GenerationProgress, QUIZ_STEPS, FLASHCARD_STEPS, SLIDES_STEPS, PODCAST_STEPS } from './ui/GenerationProgress'
import { cn } from '@/lib/utils'
import type { QuizConfig as QuizConfigType, Question, DEFAULT_QUIZ_CONFIG } from '@/types/quiz'
import type { Flashcard } from '@/types/flashcard'
import type { Slide } from '@/types/slides'

interface PDFUploadProps {
  onQuestionsGenerated: (questions: Question[], filename: string, config: QuizConfigType) => void
  onFlashcardsGenerated?: (flashcards: Flashcard[], filename: string) => void
  onSlidesGenerated?: (slides: Slide[], slidesUrl: string, filename: string) => void
  onPodcastGenerated?: (script: string, audioUrl: string, filename: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export default function PDFUpload({ onQuestionsGenerated, onFlashcardsGenerated, onSlidesGenerated, onPodcastGenerated, isLoading, setIsLoading }: PDFUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [pdfText, setPdfText] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [flashcardLoading, setFlashcardLoading] = useState(false)
  const [slidesLoading, setSlidesLoading] = useState(false)
  const [podcastLoading, setPodcastLoading] = useState(false)
  const [flashcardCount, setFlashcardCount] = useState<15 | 30 | 45>(30)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Progress step tracking
  const [quizStep, setQuizStep] = useState(0)
  const [flashcardStep, setFlashcardStep] = useState(0)
  const [slidesStep, setSlidesStep] = useState(0)
  const [podcastStep, setPodcastStep] = useState(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Helper to simulate progress steps
  const simulateProgress = (
    setStep: React.Dispatch<React.SetStateAction<number>>,
    maxSteps: number,
    intervalMs: number = 8000
  ) => {
    let step = 0
    setStep(0)

    progressIntervalRef.current = setInterval(() => {
      step++
      if (step < maxSteps - 1) {
        setStep(step)
      }
    }, intervalMs)
  }

  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => clearProgressInterval()
  }, [])
  const [config, setConfig] = useState<QuizConfigType>({
    questionCount: 10,
    difficulty: 'intermediate',
    mode: 'practice',
    showExplanations: true,
  })

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }
    setFile(selectedFile)
    setError('')
    setShowConfig(true)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [handleFileSelect])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a PDF file')
      return
    }

    setIsLoading(true)
    setError('')
    simulateProgress(setQuizStep, QUIZ_STEPS.length, 10000)

    try {
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('config', JSON.stringify(config))

      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process PDF')
      }

      clearProgressInterval()
      setQuizStep(QUIZ_STEPS.length - 1) // Complete

      const data = await response.json()
      onQuestionsGenerated(data.questions, file.name, config)
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the PDF')
    } finally {
      clearProgressInterval()
      setIsLoading(false)
      setQuizStep(0)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPdfText('')
    setShowConfig(false)
    setError('')
  }

  const handleGenerateFlashcards = async () => {
    if (!file || !onFlashcardsGenerated) return

    setFlashcardLoading(true)
    setError('')
    simulateProgress(setFlashcardStep, FLASHCARD_STEPS.length, 10000)

    try {
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('difficulty', config.difficulty)
      formData.append('cardCount', String(flashcardCount))

      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate flashcards')
      }

      clearProgressInterval()
      setFlashcardStep(FLASHCARD_STEPS.length - 1)

      const data = await response.json()
      onFlashcardsGenerated(data.flashcards, file.name)
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating flashcards')
    } finally {
      clearProgressInterval()
      setFlashcardLoading(false)
      setFlashcardStep(0)
    }
  }

  const handleGenerateSlides = async () => {
    if (!file || !onSlidesGenerated) return

    setSlidesLoading(true)
    setError('')
    simulateProgress(setSlidesStep, SLIDES_STEPS.length, 10000)

    try {
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('difficulty', config.difficulty)

      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate slides')
      }

      clearProgressInterval()
      setSlidesStep(SLIDES_STEPS.length - 1)

      const data = await response.json()
      onSlidesGenerated(data.slides, data.slidesUrl || '', file.name)
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating slides')
    } finally {
      clearProgressInterval()
      setSlidesLoading(false)
      setSlidesStep(0)
    }
  }

  const handleGeneratePodcast = async () => {
    if (!file || !onPodcastGenerated) return

    setPodcastLoading(true)
    setError('')
    simulateProgress(setPodcastStep, PODCAST_STEPS.length, 12000) // Podcast takes longer

    try {
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('difficulty', config.difficulty)
      formData.append('skipCache', 'true') // Force fresh audio generation

      const response = await fetch('/api/generate-podcast', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate podcast')
      }

      clearProgressInterval()
      setPodcastStep(PODCAST_STEPS.length - 1)

      const data = await response.json()
      onPodcastGenerated(data.script, data.audioUrl || '', file.name)
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating podcast')
    } finally {
      clearProgressInterval()
      setPodcastLoading(false)
      setPodcastStep(0)
    }
  }

  const anyLoading = isLoading || flashcardLoading || slidesLoading || podcastLoading

  return (
    <Card variant="dossier" padding="lg" className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div>
          <label className="block font-mono text-xs font-bold uppercase tracking-widest text-ink dark:text-slate-300 mb-3">
            Upload Your Law School PDF
          </label>

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all cursor-pointer',
                  isDragOver
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-ink/30 dark:border-slate-600 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10'
                )}
              >
                <input
                  id="pdf-upload"
                  name="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />

                <motion.div
                  animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
                  className="mb-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3v11.25"
                      />
                    </svg>
                  </div>
                </motion.div>

                <p className="text-base font-display font-bold text-ink dark:text-slate-300 mb-1">
                  {isDragOver ? 'Drop your PDF here' : 'Drop your PDF here or click to browse'}
                </p>
                <p className="text-sm font-body text-ink-light dark:text-slate-400">
                  PDF files up to 10MB
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-accent/20 dark:bg-primary/20 border-2 border-accent dark:border-primary"
              >
                <div className="w-12 h-12 rounded-xl bg-accent dark:bg-primary flex items-center justify-center flex-shrink-0 border-2 border-ink">
                  <svg
                    className="w-6 h-6 text-ink dark:text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-ink dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-sm font-mono text-ink-light dark:text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  disabled={isLoading}
                  className="p-2 rounded-lg text-ink-light hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-50 border-2 border-transparent hover:border-danger"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quiz Configuration - Collapsible */}
        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="pt-6 border-t-2 border-ink/20 dark:border-slate-700"
            >
              {/* Collapsible Header */}
              <button
                type="button"
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-paper-dark dark:bg-dark-700 border-2 border-ink/20 dark:border-slate-600 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-display text-lg font-bold text-ink dark:text-white">
                      Quiz Settings
                    </h3>
                    <p className="text-sm font-body text-ink-light dark:text-slate-400">
                      {config.questionCount} questions • {config.difficulty} • {config.mode} mode
                    </p>
                  </div>
                </div>
                <motion.svg
                  animate={{ rotate: settingsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-5 text-ink-light dark:text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>

              {/* Collapsible Content */}
              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4">
                      <QuizConfig config={config} onChange={setConfig} disabled={anyLoading} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-danger/10 border-2 border-danger"
            >
              <svg
                className="w-5 h-5 text-danger flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-body text-danger">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generation Buttons */}
        <div className="space-y-3">
          {/* Quiz Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!file || anyLoading}
            isLoading={isLoading}
          >
            {isLoading ? (
              'Generating Questions...'
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate {config.questionCount} Questions
              </>
            )}
          </Button>

          {/* Flashcard Button */}
          {onFlashcardsGenerated && (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="flex-1"
                disabled={!file || anyLoading}
                isLoading={flashcardLoading}
                onClick={handleGenerateFlashcards}
              >
                {flashcardLoading ? (
                  'Generating Flashcards...'
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    Generate {flashcardCount} Flashcards
                  </>
                )}
              </Button>
              <select
                value={flashcardCount}
                onChange={(e) => setFlashcardCount(Number(e.target.value) as 15 | 30 | 45)}
                disabled={anyLoading}
                className="px-4 py-3 rounded-xl border-2 border-ink dark:border-slate-600 bg-white dark:bg-dark-800 text-ink dark:text-white font-display font-bold text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 shadow-hard-sm dark:shadow-none"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={45}>45</option>
              </select>
            </div>
          )}

          {/* Slides Button */}
          {onSlidesGenerated && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={!file || anyLoading}
              isLoading={slidesLoading}
              onClick={handleGenerateSlides}
            >
              {slidesLoading ? (
                'Generating Slides...'
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  Generate Slides
                </>
              )}
            </Button>
          )}

          {/* Podcast Button */}
          {onPodcastGenerated && (
            <Button
              type="button"
              variant="volt"
              size="lg"
              className="w-full"
              disabled={!file || anyLoading}
              isLoading={podcastLoading}
              onClick={handleGeneratePodcast}
            >
              {podcastLoading ? (
                'Generating Podcast...'
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                  Generate Podcast
                </>
              )}
            </Button>
          )}
        </div>

        {/* Progress Indicators */}
        <AnimatePresence>
          {isLoading && (
            <GenerationProgress
              steps={QUIZ_STEPS}
              currentStep={quizStep}
              type="quiz"
            />
          )}
          {flashcardLoading && (
            <GenerationProgress
              steps={FLASHCARD_STEPS}
              currentStep={flashcardStep}
              type="flashcards"
            />
          )}
          {slidesLoading && (
            <GenerationProgress
              steps={SLIDES_STEPS}
              currentStep={slidesStep}
              type="slides"
            />
          )}
          {podcastLoading && (
            <GenerationProgress
              steps={PODCAST_STEPS}
              currentStep={podcastStep}
              type="podcast"
            />
          )}
        </AnimatePresence>
      </form>
    </Card>
  )
}

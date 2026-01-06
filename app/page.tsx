'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import PDFUpload from '@/components/PDFUpload'
import Quiz from '@/components/Quiz'
import FlashcardViewer from '@/components/FlashcardViewer'
import SlidesViewer from '@/components/SlidesViewer'
import PodcastPlayer from '@/components/PodcastPlayer'
import { Header } from '@/components/Header'
import { Logo } from '@/components/Logo'
import type { Question, QuizConfig, DEFAULT_QUIZ_CONFIG } from '@/types/quiz'
import type { Flashcard } from '@/types/flashcard'
import type { Slide } from '@/types/slides'

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [slides, setSlides] = useState<Slide[]>([])
  const [slidesUrl, setSlidesUrl] = useState<string>('')
  const [podcastScript, setPodcastScript] = useState<string>('')
  const [podcastAudioUrl, setPodcastAudioUrl] = useState<string>('')
  const [pdfFilename, setPdfFilename] = useState<string>('')
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    questionCount: 10,
    difficulty: 'intermediate',
    mode: 'practice',
    showExplanations: true,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleQuestionsGenerated = (
    generatedQuestions: Question[],
    filename: string,
    config: QuizConfig
  ) => {
    setQuestions(generatedQuestions)
    setPdfFilename(filename)
    setQuizConfig(config)
  }

  const handleFlashcardsGenerated = (
    generatedFlashcards: Flashcard[],
    filename: string
  ) => {
    setFlashcards(generatedFlashcards)
    setPdfFilename(filename)
  }

  const handleSlidesGenerated = (
    generatedSlides: Slide[],
    url: string,
    filename: string
  ) => {
    setSlides(generatedSlides)
    setSlidesUrl(url)
    setPdfFilename(filename)
  }

  const handleQuizComplete = () => {
    setQuestions([])
    setPdfFilename('')
  }

  const handleFlashcardsClose = () => {
    setFlashcards([])
    setPdfFilename('')
  }

  const handleSlidesClose = () => {
    setSlides([])
    setSlidesUrl('')
    setPdfFilename('')
  }

  const handlePodcastGenerated = (
    script: string,
    audioUrl: string,
    filename: string
  ) => {
    setPodcastScript(script)
    setPodcastAudioUrl(audioUrl)
    setPdfFilename(filename)
  }

  const handlePodcastClose = () => {
    setPodcastScript('')
    setPodcastAudioUrl('')
    setPdfFilename('')
  }

  // Show podcast if we have one
  if (podcastScript) {
    return (
      <div className="min-h-screen bg-gradient-main">
        <Header />
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <PodcastPlayer
              script={podcastScript}
              audioUrl={podcastAudioUrl}
              title={pdfFilename.replace('.pdf', '')}
              onClose={handlePodcastClose}
            />
          </div>
        </main>
      </div>
    )
  }

  // Show slides if we have them
  if (slides.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-main">
        <Header />
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <SlidesViewer
              slides={slides}
              slidesUrl={slidesUrl}
              title={pdfFilename.replace('.pdf', '')}
              onClose={handleSlidesClose}
            />
          </div>
        </main>
      </div>
    )
  }

  // Show flashcards if we have them
  if (flashcards.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-main">
        <Header />
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <FlashcardViewer
              flashcards={flashcards}
              title={pdfFilename.replace('.pdf', '')}
              onClose={handleFlashcardsClose}
            />
          </div>
        </main>
      </div>
    )
  }

  // Show quiz if we have questions
  if (questions.length > 0) {
    return (
      <Quiz
        questions={questions}
        pdfFilename={pdfFilename}
        config={quizConfig}
        onComplete={handleQuizComplete}
      />
    )
  }

  // Main landing page
  return (
    <div className="min-h-screen bg-gradient-main">
      <Header />

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            {/* Large Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              <Logo variant="full" size="xl" animated />
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-accent border-2 border-ink shadow-hard-sm"
            >
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink">
                AI-Powered Study Tools
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-display-lg sm:text-display-xl text-ink dark:text-white mb-6"
            >
              Ace Your{' '}
              <span className="text-primary">Nigerian Law School</span>{' '}
              Exams
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-body-lg text-ink-light dark:text-slate-400 max-w-2xl mx-auto"
            >
              Upload your law school materials and let AI generate practice questions, flashcards, slides, and podcasts tailored to Nigerian legal education.
            </motion.p>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3 mt-10"
            >
              {[
                { icon: '📄', text: 'Smart PDF Analysis' },
                { icon: '🧠', text: 'AI-Powered Questions' },
                { icon: '📊', text: 'Instant Feedback' },
                { icon: '📚', text: 'Nigerian Law Focus' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-dark-800 border-2 border-ink dark:border-slate-700 shadow-hard-sm dark:shadow-none"
                >
                  <span className="text-lg">{feature.icon}</span>
                  <span className="text-sm font-display font-bold text-ink dark:text-slate-300">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <PDFUpload
              onQuestionsGenerated={handleQuestionsGenerated}
              onFlashcardsGenerated={handleFlashcardsGenerated}
              onSlidesGenerated={handleSlidesGenerated}
              onPodcastGenerated={handlePodcastGenerated}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-20 text-center"
          >
            <div className="inline-flex items-center px-4 py-2 mb-8 rounded-full bg-primary/10 border-2 border-primary/30">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                How It Works
              </span>
            </div>

            <h2 className="text-heading-1 text-ink dark:text-white mb-12">
              Three Simple Steps
            </h2>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  title: 'Upload PDF',
                  description: 'Upload any law school material - cases, statutes, or textbooks',
                  icon: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  ),
                },
                {
                  step: '2',
                  title: 'Configure',
                  description: 'Choose difficulty, question count, and study mode',
                  icon: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                  ),
                },
                {
                  step: '3',
                  title: 'Learn',
                  description: 'Answer questions, get explanations, and track progress',
                  icon: (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  ),
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="relative p-6 pt-8 rounded-2xl bg-white dark:bg-dark-800 border-2 border-ink dark:border-slate-700 shadow-hard dark:shadow-none"
                >
                  {/* Step number badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="w-9 h-9 rounded-xl bg-primary text-white font-display font-bold flex items-center justify-center text-lg border-2 border-ink shadow-hard-sm">
                      {item.step}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                    {item.icon}
                  </div>

                  <h3 className="font-display text-xl font-bold text-ink dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm text-ink-light dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-20 text-center py-8 border-t-2 border-ink/10 dark:border-slate-800"
          >
            <p className="font-body text-sm text-ink-light dark:text-slate-500">
              Built for Nigerian law students with care
            </p>
          </motion.footer>
        </div>
      </main>
    </div>
  )
}

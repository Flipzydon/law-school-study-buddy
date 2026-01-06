'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/Button'
import type { Slide } from '@/types/slides'

interface SlidesViewerProps {
  slides: Slide[]
  slidesUrl?: string
  title: string
  onClose?: () => void
}

export default function SlidesViewer({ slides, slidesUrl, title, onClose }: SlidesViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [viewMode, setViewMode] = useState<'preview' | 'pdf'>('preview')

  const handlePrevious = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
  }, [currentSlide])

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    }
  }, [currentSlide, slides.length])

  const handleDownload = () => {
    if (slidesUrl) {
      const link = document.createElement('a')
      link.href = slidesUrl
      link.download = `${title.replace(/\s+/g, '_')}_slides.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'j':
          e.preventDefault()
          handleNext()
          break
        case 'ArrowLeft':
        case 'k':
          e.preventDefault()
          handlePrevious()
          break
        case 'Escape':
          if (onClose) {
            onClose()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrevious, onClose])

  const slide = slides[currentSlide]
  const progress = ((currentSlide + 1) / slides.length) * 100

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border-2 border-ink dark:border-slate-700 shadow-hard overflow-hidden">
      {/* Header */}
      <div className="bg-primary px-4 sm:px-6 py-4 text-white border-b-2 border-ink">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg sm:text-xl font-bold truncate">{title}</h2>
            <p className="text-primary-100 text-sm font-body">
              Slide {currentSlide + 1} of {slides.length}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {slidesUrl && (
              <>
                <button
                  onClick={() => setViewMode(viewMode === 'preview' ? 'pdf' : 'preview')}
                  className="px-3 py-1.5 rounded-lg text-sm font-mono font-bold bg-white/20 text-white hover:bg-white/30 transition-colors border border-white/30"
                >
                  {viewMode === 'preview' ? 'View PDF' : 'Preview'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg text-sm font-mono font-bold bg-accent text-ink hover:bg-accent-hover transition-colors border-2 border-ink shadow-[2px_2px_0px_0px_#1A1A1A]"
                >
                  Download
                </button>
              </>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-white hover:text-primary-100 transition-colors rounded-lg hover:bg-white/10"
                aria-label="Close slides viewer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {viewMode === 'pdf' && slidesUrl ? (
          <div className="aspect-[16/9] bg-paper-dark dark:bg-dark-700 rounded-xl overflow-hidden border-2 border-ink">
            <iframe
              src={slidesUrl}
              className="w-full h-full"
              title="Slides PDF"
            />
          </div>
        ) : (
          /* Slide Preview */
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="aspect-[16/9] bg-paper dark:bg-dark-700 rounded-xl border-2 border-ink shadow-hard overflow-hidden"
            >
              {/* Slide Header */}
              <div className="bg-primary px-6 sm:px-8 py-4 sm:py-6 border-b-2 border-ink">
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight max-w-[80%]">
                    {slide.title}
                  </h3>
                  <span className="text-white/60 text-sm font-mono bg-white/10 px-2 py-1 rounded-lg">
                    {currentSlide + 1}/{slides.length}
                  </span>
                </div>
              </div>

              {/* Slide Content */}
              <div className="px-6 sm:px-8 py-4 sm:py-6 flex-1">
                <ul className="space-y-3 sm:space-y-4">
                  {slide.bullets.map((bullet, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <span className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0 border border-ink" />
                      <span className="text-ink dark:text-slate-200 text-base sm:text-lg font-body leading-relaxed">{bullet}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Slide Footer */}
              {slide.footer && (
                <div className="px-6 sm:px-8 py-3 border-t-2 border-ink/20 bg-paper-dark dark:bg-dark-600">
                  <p className="text-sm text-ink-light dark:text-slate-400 font-mono">{slide.footer}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSlide === 0}
            className="flex-1 sm:flex-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline ml-2">Previous</span>
          </Button>

          {/* Slide Dots */}
          <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 max-w-[200px] sm:max-w-none">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all flex-shrink-0 border-2 ${
                  index === currentSlide
                    ? 'bg-primary border-ink scale-125 shadow-[2px_2px_0px_0px_#1A1A1A]'
                    : 'bg-paper-dark dark:bg-dark-600 border-ink/30 hover:border-primary'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={currentSlide === slides.length - 1}
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline mr-2">Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>

        {/* Keyboard hints */}
        <div className="mt-6 pt-4 border-t-2 border-ink/10 dark:border-slate-700">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              { key: '←', action: 'Previous' },
              { key: '→', action: 'Next' },
            ].map(({ key, action }) => (
              <div key={key} className="flex items-center gap-2 text-ink-light dark:text-slate-400">
                <kbd className="px-2 py-1 bg-paper-dark dark:bg-dark-700 rounded-lg text-xs font-mono font-bold border-2 border-ink/20">
                  {key}
                </kbd>
                <span className="font-body">{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/Button'
import type { Flashcard } from '@/types/flashcard'

interface FlashcardViewerProps {
  flashcards: Flashcard[]
  title: string
  onClose?: () => void
}

export default function FlashcardViewer({ flashcards, title, onClose }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [cards] = useState<Flashcard[]>(flashcards)
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set())
  const cardRef = useRef<HTMLDivElement>(null)

  const currentCard = cards[currentIndex]

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsFlipped(false)
    }
  }, [currentIndex, cards.length])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setIsFlipped(false)
    }
  }, [currentIndex])

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev)
  }, [])

  const toggleMastered = useCallback(() => {
    if (!currentCard) return
    const newMastered = new Set(masteredCards)
    if (newMastered.has(currentCard.id)) {
      newMastered.delete(currentCard.id)
    } else {
      newMastered.add(currentCard.id)
    }
    setMasteredCards(newMastered)
  }, [currentCard, masteredCards])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
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
        case ' ':
        case 'Enter':
          e.preventDefault()
          handleFlip()
          break
        case 'm':
        case 'M':
          e.preventDefault()
          toggleMastered()
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
  }, [handleNext, handlePrevious, handleFlip, toggleMastered, onClose])

  // Focus management for keyboard events
  useEffect(() => {
    cardRef.current?.focus()
  }, [currentIndex])

  if (!currentCard) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-2xl border-2 border-ink dark:border-slate-700 shadow-hard p-8 text-center">
        <p className="text-ink-light dark:text-slate-400 font-body">No flashcards available.</p>
      </div>
    )
  }

  const isMastered = masteredCards.has(currentCard.id)
  const progress = ((currentIndex + 1) / cards.length) * 100

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border-2 border-ink dark:border-slate-700 shadow-hard overflow-hidden">
      {/* Header */}
      <div className="bg-primary px-4 sm:px-6 py-4 text-white border-b-2 border-ink">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg sm:text-xl font-bold truncate">{title}</h2>
            <p className="text-primary-100 text-sm font-body">
              Card {currentIndex + 1} of {cards.length}
              {masteredCards.size > 0 && ` • ${masteredCards.size} mastered`}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-white hover:text-primary-100 transition-colors rounded-lg hover:bg-white/10"
              aria-label="Close flashcard viewer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
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

      {/* Card Area */}
      <div className="p-4 sm:p-6">
        <div
          ref={cardRef}
          tabIndex={0}
          className="relative h-72 sm:h-80 perspective-1000 cursor-pointer mb-4 sm:mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
          onClick={handleFlip}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              handleFlip()
            }
          }}
          role="button"
          aria-label={`Flashcard: ${isFlipped ? 'showing answer' : 'showing question'}. Press space or enter to flip.`}
        >
          <motion.div
            className="relative w-full h-full"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <div
              className={`absolute inset-0 rounded-xl border-2 ${
                isMastered ? 'border-accent bg-accent/10' : 'border-ink bg-paper dark:bg-dark-700'
              } shadow-hard p-6 sm:p-8 flex flex-col items-center justify-center backface-hidden`}
              aria-hidden={isFlipped}
            >
              {currentCard.type && (
                <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-lg border-2 border-ink ${
                  currentCard.type === 'case'
                    ? 'bg-primary/10 text-primary'
                    : currentCard.type === 'term'
                    ? 'bg-accent/20 text-ink'
                    : 'bg-paper-dark text-ink-light'
                }`}>
                  {currentCard.type}
                </span>
              )}
              {isMastered && (
                <span className="absolute top-4 right-4 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-lg bg-accent text-ink border-2 border-ink">
                  Mastered
                </span>
              )}
              <p className="text-xl sm:text-2xl text-ink dark:text-white text-center font-display font-bold leading-relaxed">
                {currentCard.front}
              </p>
              <p className="text-ink-lighter dark:text-slate-500 text-sm font-body mt-6">
                Click or press Space to flip
              </p>
            </div>

            {/* Back */}
            <div
              className={`absolute inset-0 rounded-xl border-2 ${
                isMastered ? 'border-accent' : 'border-primary'
              } bg-primary/5 dark:bg-primary/10 shadow-hard p-6 sm:p-8 flex flex-col items-center justify-center backface-hidden overflow-auto`}
              style={{ transform: 'rotateY(180deg)' }}
              aria-hidden={!isFlipped}
            >
              <p className="text-lg sm:text-xl text-ink dark:text-white text-center font-body leading-relaxed">
                {currentCard.back}
              </p>
              <p className="text-ink-lighter dark:text-slate-500 text-sm font-body mt-6">
                Click or press Space to flip back
              </p>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 sm:flex-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline ml-2">Previous</span>
          </Button>

          <Button
            variant={isMastered ? 'volt' : 'secondary'}
            onClick={toggleMastered}
            className="flex-1 sm:flex-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="hidden sm:inline ml-2">{isMastered ? 'Mastered' : 'Mark Mastered'}</span>
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
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
              { key: 'Space', action: 'Flip' },
              { key: '→', action: 'Next' },
              { key: 'M', action: 'Master' },
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

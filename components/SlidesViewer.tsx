'use client'

import { useState } from 'react'
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

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    }
  }

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

  const slide = slides[currentSlide]
  const progress = ((currentSlide + 1) / slides.length) * 100

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-primary-100 text-sm">
              Slide {currentSlide + 1} of {slides.length}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {slidesUrl && (
              <>
                <button
                  onClick={() => setViewMode(viewMode === 'preview' ? 'pdf' : 'preview')}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-400 transition-colors"
                >
                  {viewMode === 'preview' ? 'View PDF' : 'Preview Mode'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  Download PDF
                </button>
              </>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-primary-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-primary-400 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'pdf' && slidesUrl ? (
          <div className="aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden">
            <iframe
              src={slidesUrl}
              className="w-full h-full"
              title="Slides PDF"
            />
          </div>
        ) : (
          /* Slide Preview */
          <div className="aspect-[16/9] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-inner overflow-hidden">
            {/* Slide Header */}
            <div className="bg-primary-500 px-8 py-6">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-white leading-tight max-w-[80%]">
                  {slide.title}
                </h3>
                <span className="text-primary-200 text-sm">
                  {currentSlide + 1} / {slides.length}
                </span>
              </div>
            </div>

            {/* Slide Content */}
            <div className="px-8 py-6 flex-1">
              <ul className="space-y-4">
                {slide.bullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                    <span className="text-slate-700 text-lg">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Slide Footer */}
            {slide.footer && (
              <div className="px-8 py-3 border-t border-slate-200 bg-slate-50">
                <p className="text-sm text-slate-500">{slide.footer}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          {/* Slide Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  index === currentSlide
                    ? 'bg-primary-500'
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Keyboard hints */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500 text-center">
            Use arrow keys to navigate between slides
          </p>
        </div>
      </div>
    </div>
  )
}

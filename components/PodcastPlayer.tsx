'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/Button'

interface PodcastPlayerProps {
  script: string
  audioUrl: string
  duration?: number
  title: string
  onClose?: () => void
}

export default function PodcastPlayer({ script, audioUrl, duration, title, onClose }: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration || 0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [showScript, setShowScript] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [highlightEnabled, setHighlightEnabled] = useState(true)
  const userScrolledRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])

  // Split script into words for highlighting
  const words = useMemo(() => {
    return script.split(/(\s+)/).filter(Boolean)
  }, [script])

  // Calculate current word index based on audio progress
  const currentWordIndex = useMemo(() => {
    if (!isPlaying || audioDuration <= 0 || !highlightEnabled) return -1
    const totalWords = words.filter(w => w.trim()).length
    const progress = currentTime / audioDuration
    return Math.floor(progress * totalWords)
  }, [currentTime, audioDuration, isPlaying, words, highlightEnabled])

  // Get actual word index (accounting for whitespace tokens)
  const getActualWordIndex = (tokenIndex: number) => {
    let wordCount = 0
    for (let i = 0; i <= tokenIndex; i++) {
      if (words[i]?.trim()) wordCount++
    }
    return wordCount - 1
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration)
      setIsLoading(false)
    }
    const handleEnded = () => setIsPlaying(false)
    const handleCanPlay = () => setIsLoading(false)
    const handleError = () => {
      setError('Failed to load audio. Please try again.')
      setIsLoading(false)
    }
    const handleWaiting = () => setIsLoading(true)
    const handlePlaying = () => setIsLoading(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
    }
  }, [])

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {
        setError('Unable to play audio. Please try again.')
      })
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const time = parseFloat(e.target.value)
    audio.currentTime = time
    setCurrentTime(time)
  }

  const handlePlaybackRateChange = (rate: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.playbackRate = rate
    setPlaybackRate(rate)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const vol = parseFloat(e.target.value)
    audio.volume = vol
    setVolume(vol)
  }

  const skipBackward = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, audio.currentTime - 10)
  }, [])

  const skipForward = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.min(audioDuration, audio.currentTime + 10)
  }, [audioDuration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDownloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = `${title.replace(/\s+/g, '_')}_podcast.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDownloadScript = () => {
    const blob = new Blob([script], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/\s+/g, '_')}_script.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlayPause()
          break
        case 'ArrowLeft':
        case 'j':
          e.preventDefault()
          skipBackward()
          break
        case 'ArrowRight':
        case 'l':
          e.preventDefault()
          skipForward()
          break
        case 'ArrowUp':
          e.preventDefault()
          if (audioRef.current) {
            const newVolume = Math.min(1, volume + 0.1)
            audioRef.current.volume = newVolume
            setVolume(newVolume)
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          if (audioRef.current) {
            const newVolume = Math.max(0, volume - 0.1)
            audioRef.current.volume = newVolume
            setVolume(newVolume)
          }
          break
        case 'm':
          e.preventDefault()
          if (audioRef.current) {
            const newVolume = volume > 0 ? 0 : 1
            audioRef.current.volume = newVolume
            setVolume(newVolume)
          }
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
  }, [togglePlayPause, skipBackward, skipForward, volume, onClose])

  // Auto-scroll transcript based on audio progress
  useEffect(() => {
    if (!autoScroll || !isPlaying || !showScript || userScrolledRef.current) return

    const transcript = transcriptRef.current
    if (!transcript || audioDuration <= 0) return

    // Calculate scroll position based on audio progress
    const scrollableHeight = transcript.scrollHeight - transcript.clientHeight
    const targetScrollTop = (currentTime / audioDuration) * scrollableHeight

    // Smooth scroll to target position
    transcript.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    })
  }, [currentTime, audioDuration, autoScroll, isPlaying, showScript])

  // Handle manual scroll - temporarily disable auto-scroll
  const handleTranscriptScroll = useCallback(() => {
    if (!autoScroll) return

    // Mark that user has scrolled manually
    userScrolledRef.current = true

    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Re-enable auto-scroll after 3 seconds of no manual scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      userScrolledRef.current = false
    }, 3000)
  }, [autoScroll])

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0

  return (
    <div
      className="bg-ink dark:bg-dark-900 rounded-2xl border-2 border-ink shadow-[8px_8px_0px_0px_#CCFF00] overflow-hidden"
      role="application"
      aria-label={`Podcast player: ${title}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-600 px-4 sm:px-6 py-4 text-white border-b-2 border-ink">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 flex items-center gap-4">
            {/* Album Art / Icon */}
            <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent-hover rounded-xl border-2 border-white flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-ink" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold truncate">{title}</h2>
              <p className="text-primary-100 text-sm font-body">
                Podcast Summary
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-white hover:text-primary-100 transition-colors rounded-lg hover:bg-white/10"
              aria-label="Close podcast player"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Audio Player */}
      <div className="p-4 sm:p-6 bg-ink">
        {audioUrl ? (
          <audio ref={audioRef} src={audioUrl} preload="metadata" />
        ) : (
          <div className="mb-4 p-4 bg-primary/20 border-2 border-primary rounded-xl text-white text-sm font-body text-center">
            Audio generation failed. You can still read the transcript below.
          </div>
        )}

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-danger/20 border-2 border-danger rounded-xl text-danger text-sm font-body"
              role="alert"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio Controls - only show when audioUrl exists */}
        {audioUrl && (
          <>
            {/* Progress Bar */}
            <div className="mb-6">
              <label htmlFor="audio-progress" className="sr-only">
                Audio progress: {formatTime(currentTime)} of {formatTime(audioDuration)}
              </label>
              <div className="relative h-3 bg-ink-light/30 rounded-full overflow-hidden border border-white/20">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-accent rounded-full"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                >
                  {/* Glowing Edge */}
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_#fff]" />
                </motion.div>
              </div>
              <input
                id="audio-progress"
                type="range"
                min={0}
                max={audioDuration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ position: 'relative' }}
                aria-valuemin={0}
                aria-valuemax={audioDuration || 100}
                aria-valuenow={currentTime}
                aria-valuetext={`${formatTime(currentTime)} of ${formatTime(audioDuration)}`}
              />
              <div className="flex justify-between text-sm text-white/70 mt-2 font-mono">
                <span aria-hidden="true">{formatTime(currentTime)}</span>
                <span aria-hidden="true">{formatTime(audioDuration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 mb-6">
              {/* Skip Backward */}
              <button
                onClick={skipBackward}
                className="p-3 text-white/80 hover:text-accent transition-colors rounded-xl hover:bg-white/10 border border-white/20"
                aria-label="Skip backward 10 seconds"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                disabled={isLoading && !isPlaying}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white text-ink flex items-center justify-center hover:scale-105 transition-all shadow-[4px_4px_0px_0px_#CCFF00] border-2 border-ink disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                aria-pressed={isPlaying}
              >
                {isLoading && !isPlaying ? (
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : isPlaying ? (
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Skip Forward */}
              <button
                onClick={skipForward}
                className="p-3 text-white/80 hover:text-accent transition-colors rounded-xl hover:bg-white/10 border border-white/20"
                aria-label="Skip forward 10 seconds"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                </svg>
              </button>
            </div>

            {/* Speed & Volume Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              {/* Playback Speed */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60 font-mono uppercase tracking-wide" id="speed-label">Speed:</span>
                <div className="flex gap-1" role="group" aria-labelledby="speed-label">
                  {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handlePlaybackRateChange(rate)}
                      className={`px-2.5 py-1.5 rounded-lg text-sm font-mono font-bold transition-all border-2 ${
                        playbackRate === rate
                          ? 'bg-accent text-ink border-ink shadow-[2px_2px_0px_0px_#1A1A1A]'
                          : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                      }`}
                      aria-pressed={playbackRate === rate}
                      aria-label={`${rate}x speed`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      const newVolume = volume > 0 ? 0 : 1
                      audioRef.current.volume = newVolume
                      setVolume(newVolume)
                    }
                  }}
                  className="p-2 text-white/70 hover:text-accent transition-colors rounded-lg hover:bg-white/10"
                  aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                >
                  {volume === 0 ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
                <div className="relative w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-accent rounded-full"
                    initial={false}
                    animate={{ width: `${volume * 100}%` }}
                  />
                </div>
                <label htmlFor="volume-control" className="sr-only">
                  Volume: {Math.round(volume * 100)}%
                </label>
                <input
                  id="volume-control"
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="absolute w-24 h-2 opacity-0 cursor-pointer"
                  style={{ position: 'relative', marginLeft: '-6rem' }}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(volume * 100)}
                  aria-valuetext={`${Math.round(volume * 100)}%`}
                />
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="flex flex-wrap justify-center gap-4 text-sm mb-6 hidden sm:flex">
              {[
                { key: 'Space', action: 'Play/Pause' },
                { key: 'J/L', action: 'Skip 10s' },
                { key: 'M', action: 'Mute' },
              ].map(({ key, action }) => (
                <div key={key} className="flex items-center gap-2 text-white/50">
                  <kbd className="px-2 py-1 bg-white/10 rounded-lg text-xs font-mono font-bold border border-white/20">
                    {key}
                  </kbd>
                  <span className="font-body">{action}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Script Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setShowScript(!showScript)}
            className="flex-1 flex items-center justify-between px-4 py-4 bg-white/10 rounded-xl hover:bg-white/15 transition-colors border border-white/20"
            aria-expanded={showScript}
            aria-controls="transcript-content"
          >
            <span className="font-display font-bold text-white">Transcript</span>
            <motion.svg
              animate={{ rotate: showScript ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-5 h-5 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>

          {/* Highlight Toggle */}
          {showScript && audioUrl && (
            <button
              onClick={() => setHighlightEnabled(!highlightEnabled)}
              className={`px-3 py-4 rounded-xl border transition-all font-mono text-xs font-bold ${
                highlightEnabled
                  ? 'bg-accent text-ink border-ink shadow-[2px_2px_0px_0px_#1A1A1A]'
                  : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20'
              }`}
              aria-pressed={highlightEnabled}
              aria-label={highlightEnabled ? 'Text highlighting enabled' : 'Text highlighting disabled'}
              title={highlightEnabled ? 'Highlight ON' : 'Highlight OFF'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}

          {/* Auto-scroll Toggle */}
          {showScript && audioUrl && (
            <button
              onClick={() => {
                setAutoScroll(!autoScroll)
                userScrolledRef.current = false
              }}
              className={`px-3 py-4 rounded-xl border transition-all font-mono text-xs font-bold ${
                autoScroll
                  ? 'bg-accent text-ink border-ink shadow-[2px_2px_0px_0px_#1A1A1A]'
                  : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20'
              }`}
              aria-pressed={autoScroll}
              aria-label={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll disabled'}
              title={autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}
        </div>

        {/* Script Content */}
        <AnimatePresence>
          {showScript && (
            <motion.div
              id="transcript-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div
                ref={transcriptRef}
                onScroll={handleTranscriptScroll}
                className="max-h-64 overflow-y-auto p-4 bg-paper dark:bg-dark-700 rounded-xl border-2 border-ink scroll-smooth"
                tabIndex={0}
                role="region"
                aria-label="Podcast transcript"
              >
                <p className="leading-relaxed text-sm sm:text-base font-body">
                  {words.map((word, index) => {
                    const isWhitespace = !word.trim()
                    if (isWhitespace) {
                      return <span key={index}>{word}</span>
                    }

                    const wordIndex = getActualWordIndex(index)
                    const isCurrentWord = wordIndex === currentWordIndex
                    const isPastWord = wordIndex < currentWordIndex && currentWordIndex >= 0

                    return (
                      <span
                        key={index}
                        ref={(el) => { wordRefs.current[index] = el }}
                        className={`transition-all duration-150 ${
                          isCurrentWord
                            ? 'bg-accent text-ink px-0.5 rounded font-semibold'
                            : isPastWord
                              ? 'text-ink/60 dark:text-slate-400'
                              : 'text-ink dark:text-slate-300'
                        }`}
                      >
                        {word}
                      </span>
                    )
                  })}
                </p>
              </div>
              {/* Feature status indicators */}
              {audioUrl && (
                <div className="flex items-center justify-center gap-4 mt-2 text-xs text-white/40 font-body">
                  <div className="flex items-center gap-1">
                    <svg className={`w-3 h-3 ${highlightEnabled ? 'text-accent' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span className={highlightEnabled ? 'text-white/60' : ''}>
                      {highlightEnabled ? 'Highlighting' : 'No highlight'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className={`w-3 h-3 ${autoScroll ? 'text-accent animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span className={autoScroll ? 'text-white/60' : ''}>
                      {autoScroll ? 'Auto-scroll' : 'Manual scroll'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {audioUrl && (
            <Button
              variant="primary"
              onClick={handleDownloadAudio}
              className="flex-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Download Audio</span>
              <span className="sm:hidden">Audio</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleDownloadScript}
            className="flex-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Download Script</span>
            <span className="sm:hidden">Script</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

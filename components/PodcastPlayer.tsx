'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PodcastPlayerProps {
  script: string
  audioUrl: string
  duration?: number
  title: string
  onClose?: () => void
}

export default function PodcastPlayer({ script, audioUrl, duration, title, onClose }: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration || 0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [showScript, setShowScript] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0

  return (
    <div
      className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl overflow-hidden"
      role="application"
      aria-label={`Podcast player: ${title}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold truncate">{title}</h2>
            <p className="text-purple-100 text-sm">
              Podcast Summary
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-white hover:text-purple-100 transition-colors rounded-lg hover:bg-purple-500"
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
      <div className="p-4 sm:p-6">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
              role="alert"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="mb-4">
          <label htmlFor="audio-progress" className="sr-only">
            Audio progress: {formatTime(currentTime)} of {formatTime(audioDuration)}
          </label>
          <input
            id="audio-progress"
            type="range"
            min={0}
            max={audioDuration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-200 dark:bg-dark-600 rounded-lg appearance-none cursor-pointer accent-purple-600"
            aria-valuemin={0}
            aria-valuemax={audioDuration || 100}
            aria-valuenow={currentTime}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(audioDuration)}`}
          />
          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-1">
            <span aria-hidden="true">{formatTime(currentTime)}</span>
            <span aria-hidden="true">{formatTime(audioDuration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6">
          {/* Skip Backward */}
          <button
            onClick={skipBackward}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-dark-700"
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
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            aria-pressed={isPlaying}
          >
            {isLoading && !isPlaying ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Skip Forward */}
          <button
            onClick={skipForward}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-dark-700"
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
            <span className="text-sm text-slate-500 dark:text-slate-400" id="speed-label">Speed:</span>
            <div className="flex gap-1" role="group" aria-labelledby="speed-label">
              {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handlePlaybackRateChange(rate)}
                  className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                    playbackRate === rate
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-dark-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-500'
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (audioRef.current) {
                  const newVolume = volume > 0 ? 0 : 1
                  audioRef.current.volume = newVolume
                  setVolume(newVolume)
                }
              }}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
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
              className="w-20 h-2 bg-slate-200 dark:bg-dark-600 rounded-lg appearance-none cursor-pointer accent-purple-600"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(volume * 100)}
              aria-valuetext={`${Math.round(volume * 100)}%`}
            />
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="text-xs text-slate-400 dark:text-slate-500 text-center mb-4 hidden sm:block">
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-dark-700 rounded font-mono">Space</kbd> Play/Pause
          <span className="mx-2">|</span>
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-dark-700 rounded font-mono">J/L</kbd> Skip 10s
          <span className="mx-2">|</span>
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-dark-700 rounded font-mono">M</kbd> Mute
        </div>

        {/* Script Toggle */}
        <button
          onClick={() => setShowScript(!showScript)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-dark-700 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-600 transition-colors mb-4"
          aria-expanded={showScript}
          aria-controls="transcript-content"
        >
          <span className="font-medium text-slate-700 dark:text-slate-200">Transcript</span>
          <svg
            className={`w-5 h-5 text-slate-500 transition-transform ${showScript ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

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
                className="max-h-64 overflow-y-auto p-4 bg-slate-50 dark:bg-dark-700 rounded-lg border border-slate-200 dark:border-dark-600"
                tabIndex={0}
                role="region"
                aria-label="Podcast transcript"
              >
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  {script}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {audioUrl && (
            <button
              onClick={handleDownloadAudio}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              aria-label="Download audio as MP3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Download Audio</span>
              <span className="sm:hidden">Audio</span>
            </button>
          )}
          <button
            onClick={handleDownloadScript}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-dark-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-dark-500 transition-colors"
            aria-label="Download script as text file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Download Script</span>
            <span className="sm:hidden">Script</span>
          </button>
        </div>
      </div>
    </div>
  )
}

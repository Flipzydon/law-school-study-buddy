'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo, LogoCompact } from './Logo'
import { ThemeToggle } from './ui/Toggle'
import { Button } from './ui/Button'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface HeaderProps {
  showHistory?: boolean
  onHistoryClick?: () => void
  className?: string
}

export function Header({ showHistory = false, onHistoryClick, className }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const { user, loading, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    await signOut()
    router.push('/login')
    router.refresh()
    setIsLoggingOut(false)
  }

  const getUserDisplayName = () => {
    if (!user) return ''
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full',
        'bg-paper/95 dark:bg-dark-900/95 backdrop-blur-md',
        'border-b-2 border-ink dark:border-slate-800',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Full on desktop, compact on mobile */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="hidden sm:block">
                <Logo variant="full" size="md" animated />
              </div>
              <div className="sm:hidden">
                <LogoCompact />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-2">
            {showHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onHistoryClick}
                className="text-ink-light dark:text-slate-400"
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                History
              </Button>
            )}

            <ThemeToggle
              isDark={resolvedTheme === 'dark'}
              onChange={(isDark) => setTheme(isDark ? 'dark' : 'light')}
            />

            {/* Auth Section */}
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2 ml-2">
                    <Link href="/library">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-ink-light dark:text-slate-400"
                      >
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        Library
                      </Button>
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-paper-dark dark:bg-dark-800 border-2 border-ink/20 dark:border-slate-700">
                      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center border-2 border-ink">
                        <span className="text-xs font-display font-bold text-white">
                          {getUserDisplayName().charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-display font-medium text-ink dark:text-slate-300 max-w-[100px] truncate">
                        {getUserDisplayName()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      isLoading={isLoggingOut}
                      className="text-ink-light dark:text-slate-400"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 ml-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button variant="primary" size="sm">
                        Sign up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Mobile Navigation */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle
              isDark={resolvedTheme === 'dark'}
              onChange={(isDark) => setTheme(isDark ? 'dark' : 'light')}
            />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-ink dark:text-slate-400 hover:bg-paper-dark dark:hover:bg-dark-800 border-2 border-transparent hover:border-ink/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden border-t-2 border-ink/20 dark:border-slate-800"
            >
              <div className="py-4 space-y-2">
                {showHistory && (
                  <button
                    onClick={() => {
                      onHistoryClick?.()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center w-full px-4 py-3 text-ink dark:text-slate-400 hover:bg-paper-dark dark:hover:bg-dark-800 rounded-xl font-display font-medium"
                  >
                    <svg
                      className="w-5 h-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Quiz History
                  </button>
                )}

                {/* Mobile Auth Section */}
                {!loading && (
                  <>
                    {user ? (
                      <>
                        <div className="px-4 py-3 flex items-center gap-3 bg-paper-dark dark:bg-dark-800 rounded-xl mx-2 border-2 border-ink/20">
                          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center border-2 border-ink">
                            <span className="text-sm font-display font-bold text-white">
                              {getUserDisplayName().charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-base font-display font-medium text-ink dark:text-slate-300">
                            {getUserDisplayName()}
                          </span>
                        </div>
                        <Link
                          href="/library"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center w-full px-4 py-3 text-ink dark:text-slate-400 hover:bg-paper-dark dark:hover:bg-dark-800 rounded-xl font-display font-medium"
                        >
                          <svg
                            className="w-5 h-5 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                          My Library
                        </Link>
                        <button
                          onClick={() => {
                            handleSignOut()
                            setIsMenuOpen(false)
                          }}
                          disabled={isLoggingOut}
                          className="flex items-center w-full px-4 py-3 text-danger dark:text-red-400 hover:bg-danger/10 rounded-xl font-display font-medium"
                        >
                          <svg
                            className="w-5 h-5 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                      </>
                    ) : (
                      <div className="px-2 py-2 flex flex-col gap-2">
                        <Link
                          href="/login"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Button variant="outline" size="lg" className="w-full">
                            Log in
                          </Button>
                        </Link>
                        <Link
                          href="/signup"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Button variant="primary" size="lg" className="w-full">
                            Sign up
                          </Button>
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

// Simple header for quiz pages (minimal distraction)
export function QuizHeader({
  currentQuestion,
  totalQuestions,
  timeRemaining,
  className
}: {
  currentQuestion: number
  totalQuestions: number
  timeRemaining?: number
  className?: string
}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full py-3',
        'bg-paper/95 dark:bg-dark-900/95 backdrop-blur-md',
        'border-b-2 border-ink dark:border-slate-800',
        className
      )}
    >
      <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
        <LogoCompact />

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-paper-dark dark:bg-dark-800 border-2 border-ink/20 dark:border-slate-700">
            <span className="text-sm font-display font-bold text-ink dark:text-slate-300">
              Question {currentQuestion} of {totalQuestions}
            </span>
          </div>

          {timeRemaining !== undefined && (
            <div className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl border-2',
              timeRemaining < 120
                ? 'bg-danger/10 border-danger text-danger'
                : 'bg-paper-dark dark:bg-dark-800 border-ink/20 dark:border-slate-700 text-ink dark:text-slate-400'
            )}>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-mono font-bold text-sm">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

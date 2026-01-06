import type { QuizHistoryItem, UserStats, QuizState } from '@/types/quiz'
import { generateId } from './utils'

const STORAGE_KEYS = {
  QUIZ_STATE: 'nlssb_quiz_state',
  QUIZ_HISTORY: 'nlssb_quiz_history',
  USER_PREFERENCES: 'nlssb_preferences',
  THEME: 'nlssb_theme',
  LAST_QUIZ_DATE: 'nlssb_last_quiz_date',
  STREAK: 'nlssb_streak',
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Quiz State (for resuming interrupted quizzes)
export function saveQuizState(state: QuizState): void {
  if (!isBrowser) return
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_STATE, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save quiz state:', error)
  }
}

export function getQuizState(): QuizState | null {
  if (!isBrowser) return null
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_STATE)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function clearQuizState(): void {
  if (!isBrowser) return
  localStorage.removeItem(STORAGE_KEYS.QUIZ_STATE)
}

// Quiz History
export function addToHistory(result: Omit<QuizHistoryItem, 'id'>): void {
  if (!isBrowser) return
  try {
    const history = getHistory()
    const newItem: QuizHistoryItem = {
      ...result,
      id: generateId(),
    }
    history.unshift(newItem) // Add to beginning
    // Keep only last 50 quizzes
    const trimmedHistory = history.slice(0, 50)
    localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(trimmedHistory))

    // Update streak
    updateStreak()
  } catch (error) {
    console.error('Failed to add to history:', error)
  }
}

export function getHistory(): QuizHistoryItem[] {
  if (!isBrowser) return []
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function clearHistory(): void {
  if (!isBrowser) return
  localStorage.removeItem(STORAGE_KEYS.QUIZ_HISTORY)
}

// User Stats
export function getStats(): UserStats {
  if (!isBrowser) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      currentStreak: 0,
      lastQuizDate: null,
    }
  }

  const history = getHistory()

  if (history.length === 0) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      currentStreak: getStreak(),
      lastQuizDate: null,
    }
  }

  const totalQuizzes = history.length
  const averageScore = Math.round(
    history.reduce((sum, quiz) => sum + quiz.percentage, 0) / history.length
  )
  const bestScore = Math.max(...history.map((quiz) => quiz.percentage))
  const lastQuizDate = history[0]?.date || null

  return {
    totalQuizzes,
    averageScore,
    bestScore,
    currentStreak: getStreak(),
    lastQuizDate,
  }
}

// Streak tracking
function updateStreak(): void {
  if (!isBrowser) return

  const today = new Date().toDateString()
  const lastQuizDate = localStorage.getItem(STORAGE_KEYS.LAST_QUIZ_DATE)
  let currentStreak = getStreak()

  if (!lastQuizDate) {
    // First quiz ever
    currentStreak = 1
  } else {
    const lastDate = new Date(lastQuizDate)
    const todayDate = new Date(today)
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0) {
      // Same day, streak stays the same
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      currentStreak += 1
    } else {
      // Streak broken, reset to 1
      currentStreak = 1
    }
  }

  localStorage.setItem(STORAGE_KEYS.LAST_QUIZ_DATE, today)
  localStorage.setItem(STORAGE_KEYS.STREAK, currentStreak.toString())
}

function getStreak(): number {
  if (!isBrowser) return 0
  const streak = localStorage.getItem(STORAGE_KEYS.STREAK)
  return streak ? parseInt(streak, 10) : 0
}

// User Preferences
export interface UserPreferences {
  defaultDifficulty: 'basic' | 'intermediate' | 'advanced'
  defaultQuestionCount: number
  defaultMode: 'practice' | 'exam'
  showExplanations: boolean
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultDifficulty: 'intermediate',
  defaultQuestionCount: 10,
  defaultMode: 'practice',
  showExplanations: true,
}

export function getPreferences(): UserPreferences {
  if (!isBrowser) return DEFAULT_PREFERENCES
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
    return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function savePreferences(preferences: Partial<UserPreferences>): void {
  if (!isBrowser) return
  try {
    const current = getPreferences()
    const updated = { ...current, ...preferences }
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save preferences:', error)
  }
}

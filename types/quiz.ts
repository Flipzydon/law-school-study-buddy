export interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  difficulty?: 'basic' | 'intermediate' | 'advanced'
}

export interface QuizConfig {
  questionCount: 5 | 10 | 15 | 20
  difficulty: 'basic' | 'intermediate' | 'advanced'
  mode: 'practice' | 'exam'
  showExplanations: boolean
  timeLimit?: number // minutes, undefined for no limit
}

export interface QuizState {
  questions: Question[]
  currentIndex: number
  answers: (number | null)[]
  startTime: number
  isComplete: boolean
  config: QuizConfig
  pdfFilename: string
}

export interface QuestionResult {
  question: Question
  selectedAnswer: number | null
  isCorrect: boolean
  timeSpent?: number
}

export interface QuizResult {
  id: string
  score: number
  totalQuestions: number
  percentage: number
  timeSpent: number
  questionResults: QuestionResult[]
  pdfFilename: string
  config: QuizConfig
  completedAt: string
}

export interface QuizHistoryItem {
  id: string
  pdfFilename: string
  date: string
  score: number
  totalQuestions: number
  percentage: number
  difficulty: string
  mode: string
  timeSpent: number
}

export interface UserStats {
  totalQuizzes: number
  averageScore: number
  bestScore: number
  currentStreak: number
  lastQuizDate: string | null
}

export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  questionCount: 10,
  difficulty: 'intermediate',
  mode: 'practice',
  showExplanations: true,
}

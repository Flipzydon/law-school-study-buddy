import { createClient } from '@/lib/supabase/server'

// Rate limiting: 10 generations per hour per user
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  error?: string
}

/**
 * Check if user has exceeded rate limit (10 generations per hour)
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const supabase = await createClient()
  const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS)

  const { count, error } = await supabase
    .from('generated_content')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo.toISOString())

  if (error) {
    console.error('Rate limit check error:', error)
    // Allow on error to not block users
    return { allowed: true, remaining: RATE_LIMIT_MAX, resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW_MS) }
  }

  const used = count || 0
  const remaining = Math.max(0, RATE_LIMIT_MAX - used)
  const resetAt = new Date(Date.now() + RATE_LIMIT_WINDOW_MS)

  if (used >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      error: `Rate limit exceeded. You can generate up to ${RATE_LIMIT_MAX} items per hour. Please try again later.`
    }
  }

  return { allowed: true, remaining, resetAt }
}

export interface CachedContent {
  id: string
  content_data: any
  created_at: string
}

/**
 * Check for existing cached content
 * Returns cached content if it exists and is less than 7 days old
 */
export async function checkCachedContent(
  userId: string,
  pdfFilename: string,
  contentType: 'flashcards' | 'podcast' | 'slides',
  difficulty: string
): Promise<CachedContent | null> {
  const supabase = await createClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('generated_content')
    .select('id, content_data, created_at')
    .eq('user_id', userId)
    .eq('pdf_filename', pdfFilename)
    .eq('content_type', contentType)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  // Check if the difficulty matches
  const contentData = data.content_data as any
  if (contentData?.difficulty !== difficulty) {
    return null
  }

  return data
}

/**
 * Get optimal model based on difficulty level
 * Basic difficulty uses cheaper gpt-3.5-turbo
 * Intermediate and Advanced use gpt-4-turbo for better quality
 */
export function getOptimalModel(difficulty: string): string {
  return difficulty === 'basic' ? 'gpt-3.5-turbo' : 'gpt-4-turbo-preview'
}

/**
 * Get temperature based on difficulty level
 */
export function getTemperature(difficulty: string): number {
  switch (difficulty) {
    case 'basic':
      return 0.5
    case 'advanced':
      return 0.8
    default:
      return 0.7
  }
}

/**
 * Retry helper with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelayMs?: number
    maxDelayMs?: number
    shouldRetry?: (error: any) => boolean
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    shouldRetry = (error) => {
      // Retry on rate limits (429) and server errors (5xx)
      const status = error?.status || error?.response?.status
      return status === 429 || (status >= 500 && status < 600)
    }
  } = options

  let lastError: any
  let delay = initialDelayMs

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error
      }

      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
      delay = Math.min(delay * 2, maxDelayMs)
    }
  }

  throw lastError
}

/**
 * Truncate PDF text to optimal size for API calls
 */
export function truncatePdfText(text: string, maxChars: number = 10000): string {
  if (text.length <= maxChars) {
    return text
  }
  return text.slice(0, maxChars)
}

/**
 * Estimate word count from text
 */
export function estimateWordCount(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Estimate audio duration based on word count (150 words per minute)
 */
export function estimateAudioDuration(wordCount: number): number {
  return Math.round((wordCount / 150) * 60)
}

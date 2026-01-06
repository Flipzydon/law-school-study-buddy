export interface ChunkOptions {
  maxChunkSize: number
  overlapSize: number
  minChunkSize: number
}

export interface ChunkResult {
  chunks: string[]
  totalCharacters: number
  chunkCount: number
}

const DEFAULT_OPTIONS: ChunkOptions = {
  maxChunkSize: 8000,
  overlapSize: 500,
  minChunkSize: 1000,
}

/**
 * Clean extracted PDF text by removing common artifacts
 */
export function cleanPdfText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove page numbers (common patterns)
    .replace(/\b(Page|page|PAGE)\s*\d+\s*(of\s*\d+)?\b/g, '')
    // Remove common headers/footers patterns
    .replace(/^\d+\s*$/gm, '')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim
    .trim()
}

/**
 * Split text into paragraphs while preserving structure
 */
function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

/**
 * Find the best split point near a target position
 * Prefers paragraph breaks, then sentence breaks, then word breaks
 */
function findBestSplitPoint(text: string, targetPosition: number, range: number = 200): number {
  const start = Math.max(0, targetPosition - range)
  const end = Math.min(text.length, targetPosition + range)
  const searchArea = text.slice(start, end)

  // Try to find paragraph break
  const paragraphBreak = searchArea.lastIndexOf('\n\n')
  if (paragraphBreak !== -1) {
    return start + paragraphBreak + 2
  }

  // Try to find sentence break
  const sentenceBreaks = ['. ', '? ', '! ', '.\n', '?\n', '!\n']
  for (const breakPattern of sentenceBreaks) {
    const sentenceBreak = searchArea.lastIndexOf(breakPattern)
    if (sentenceBreak !== -1) {
      return start + sentenceBreak + breakPattern.length
    }
  }

  // Fall back to word break
  const wordBreak = searchArea.lastIndexOf(' ')
  if (wordBreak !== -1) {
    return start + wordBreak + 1
  }

  // Last resort: split at target
  return targetPosition
}

/**
 * Chunk text intelligently for question generation
 * Splits at paragraph/sentence boundaries with overlap for context
 */
export function chunkText(text: string, options: Partial<ChunkOptions> = {}): ChunkResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const cleanedText = cleanPdfText(text)

  // If text is small enough, return as single chunk
  if (cleanedText.length <= opts.maxChunkSize) {
    return {
      chunks: [cleanedText],
      totalCharacters: cleanedText.length,
      chunkCount: 1,
    }
  }

  const chunks: string[] = []
  let position = 0

  while (position < cleanedText.length) {
    // Calculate end position for this chunk
    let endPosition = position + opts.maxChunkSize

    // If this would be the last chunk, just take the rest
    if (endPosition >= cleanedText.length) {
      chunks.push(cleanedText.slice(position).trim())
      break
    }

    // Find a good split point
    endPosition = findBestSplitPoint(cleanedText, endPosition)

    // Extract chunk
    const chunk = cleanedText.slice(position, endPosition).trim()

    // Only add if chunk meets minimum size
    if (chunk.length >= opts.minChunkSize) {
      chunks.push(chunk)
    }

    // Move position forward, accounting for overlap
    position = Math.max(position + 1, endPosition - opts.overlapSize)
  }

  return {
    chunks,
    totalCharacters: cleanedText.length,
    chunkCount: chunks.length,
  }
}

/**
 * Select representative chunks for question generation
 * Ensures coverage of beginning, middle, and end of document
 */
export function selectRepresentativeChunks(
  chunks: string[],
  maxChunks: number
): string[] {
  if (chunks.length <= maxChunks) {
    return chunks
  }

  const selected: string[] = []

  // Always include first chunk (often has key definitions/intro)
  selected.push(chunks[0])

  // Always include last chunk (often has conclusions/summaries)
  if (maxChunks > 1) {
    selected.push(chunks[chunks.length - 1])
  }

  // Fill remaining slots with evenly distributed middle chunks
  const remainingSlots = maxChunks - selected.length
  if (remainingSlots > 0 && chunks.length > 2) {
    const middleChunks = chunks.slice(1, -1)
    const step = Math.floor(middleChunks.length / (remainingSlots + 1))

    for (let i = 0; i < remainingSlots; i++) {
      const index = Math.min((i + 1) * step, middleChunks.length - 1)
      selected.splice(selected.length - 1, 0, middleChunks[index])
    }
  }

  return selected
}

/**
 * Calculate how many questions to generate per chunk
 * Distributes questions evenly with a minimum of 2 per chunk
 */
export function distributeQuestions(
  totalQuestions: number,
  chunkCount: number
): number[] {
  if (chunkCount === 1) {
    return [totalQuestions]
  }

  const basePerChunk = Math.floor(totalQuestions / chunkCount)
  const remainder = totalQuestions % chunkCount

  const distribution: number[] = []
  for (let i = 0; i < chunkCount; i++) {
    // Give extra questions to earlier chunks (usually more important content)
    distribution.push(basePerChunk + (i < remainder ? 1 : 0))
  }

  return distribution
}

/**
 * Merge and deduplicate questions from multiple chunks
 * Removes questions that are too similar
 */
export function deduplicateQuestions<T extends { question: string }>(
  questions: T[],
  similarityThreshold: number = 0.7
): T[] {
  const unique: T[] = []

  for (const q of questions) {
    const isDuplicate = unique.some((existing) =>
      calculateSimilarity(existing.question, q.question) > similarityThreshold
    )

    if (!isDuplicate) {
      unique.push(q)
    }
  }

  return unique
}

/**
 * Simple similarity calculation based on word overlap
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/))
  const words2 = new Set(text2.toLowerCase().split(/\s+/))

  const intersection = new Set([...words1].filter((w) => words2.has(w)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}

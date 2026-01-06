import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import OpenAI from 'openai'
import {
  chunkText,
  selectRepresentativeChunks,
  distributeQuestions,
  deduplicateQuestions,
} from '@/lib/pdfChunker'
import type { Question, QuizConfig } from '@/types/quiz'

export const runtime = 'nodejs'
export const maxDuration = 120 // Increased for chunked processing

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface QuizConfigInput {
  questionCount?: number
  difficulty?: 'basic' | 'intermediate' | 'advanced'
  mode?: 'practice' | 'exam'
  showExplanations?: boolean
}

const DIFFICULTY_PROMPTS = {
  basic: `Generate straightforward questions that test basic recall and understanding of fundamental legal concepts. Questions should be clear and direct, suitable for students just beginning their legal studies. ALL questions must be at the BASIC level - do not include intermediate or advanced questions.`,
  intermediate: `Generate questions that require applying legal principles to scenarios. Include questions that test understanding of relationships between different legal concepts and their practical applications. ALL questions must be at the INTERMEDIATE level - do not include basic or advanced questions.`,
  advanced: `Generate challenging questions that require critical analysis, comparison of legal doctrines, and application to complex scenarios. Include questions about exceptions, nuances, and edge cases in Nigerian law. ALL questions must be at the ADVANCED level - do not include basic or intermediate questions.`,
}

function buildSystemPrompt(config: QuizConfigInput, questionCount: number): string {
  const difficultyInstruction = DIFFICULTY_PROMPTS[config.difficulty || 'intermediate']
  const explanationInstruction = config.showExplanations !== false
    ? `Include a detailed explanation for each question that:
   - Explains why the correct answer is right
   - References specific Nigerian laws, statutes, or case precedents where applicable
   - Briefly mentions why other options are incorrect`
    : ''

  return `You are an expert Nigerian law school tutor and examiner with deep knowledge of Nigerian legal education, including the Nigerian Law School curriculum, Council of Legal Education requirements, and Nigerian Bar examinations.

Your task is to generate exactly ${questionCount} high-quality multiple-choice questions based on the provided legal text.

${difficultyInstruction}

Each question MUST:
1. Be directly relevant to Nigerian law and legal practice
2. Test genuine understanding, not just memorization
3. Have exactly 4 answer options (A, B, C, D) that are:
   - Grammatically parallel and similar in length
   - Plausible enough to require careful thought
   - Clearly distinct from each other
4. Have ONE unambiguously correct answer
5. Be appropriate for Nigerian law school students

${explanationInstruction}

Return your response as a JSON array with this exact structure:
[
  {
    "question": "Clear, well-phrased question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    ${config.showExplanations !== false ? '"explanation": "Detailed explanation with legal references...",' : ''}
    "difficulty": "${config.difficulty || 'intermediate'}"
  }
]

Where correctAnswer is the index (0-3) of the correct option.
Return ONLY the valid JSON array, no additional text or markdown formatting.`
}

async function generateQuestionsForChunk(
  text: string,
  questionCount: number,
  config: QuizConfigInput
): Promise<Question[]> {
  const systemPrompt = buildSystemPrompt(config, questionCount)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Generate ${questionCount} multiple-choice questions based on this Nigerian law text:\n\n${text}`,
      },
    ],
    temperature: config.difficulty === 'basic' ? 0.5 : config.difficulty === 'advanced' ? 0.8 : 0.7,
    max_tokens: Math.min(4000, questionCount * 400),
  })

  const responseText = completion.choices[0]?.message?.content || ''

  // Parse JSON response
  const jsonMatch = responseText.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    throw new Error('No valid JSON array in response')
  }

  const questions = JSON.parse(jsonMatch[0]) as Question[]

  // Validate and normalize each question
  const normalizedQuestions: Question[] = []
  for (const q of questions) {
    if (
      !q.question ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      typeof q.correctAnswer !== 'number' ||
      q.correctAnswer < 0 ||
      q.correctAnswer > 3
    ) {
      throw new Error('Invalid question structure')
    }

    // Force the difficulty to match the requested difficulty
    normalizedQuestions.push({
      ...q,
      difficulty: config.difficulty || 'intermediate'
    })
  }

  return normalizedQuestions
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File
    const configStr = formData.get('config') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })
    }

    // Parse config
    let config: QuizConfigInput = {}
    if (configStr) {
      try {
        config = JSON.parse(configStr)
      } catch {
        // Use defaults if parsing fails
      }
    }

    const questionCount = config.questionCount || 10
    const showExplanations = config.showExplanations !== false

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text from PDF
    const pdfData = await pdfParse(buffer)
    const text = pdfData.text

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text could be extracted from the PDF. Please ensure the PDF contains selectable text.' },
        { status: 400 }
      )
    }

    // Chunk the text for better coverage
    const chunkResult = chunkText(text, {
      maxChunkSize: 8000,
      overlapSize: 500,
      minChunkSize: 1000,
    })

    let allQuestions: Question[] = []

    // For small documents or few questions, use single chunk
    if (chunkResult.chunkCount === 1 || questionCount <= 5) {
      const singleChunkText = chunkResult.chunks[0].slice(0, 12000) // Slightly larger limit for single chunk
      allQuestions = await generateQuestionsForChunk(
        singleChunkText,
        questionCount,
        { ...config, showExplanations }
      )
    } else {
      // For larger documents, use multiple chunks
      const maxChunks = Math.min(3, chunkResult.chunkCount) // Use up to 3 chunks
      const selectedChunks = selectRepresentativeChunks(chunkResult.chunks, maxChunks)
      const questionsPerChunk = distributeQuestions(questionCount, selectedChunks.length)

      // Generate questions for each chunk in parallel
      const chunkPromises = selectedChunks.map((chunk, index) =>
        generateQuestionsForChunk(chunk, questionsPerChunk[index], { ...config, showExplanations })
          .catch((error) => {
            console.error(`Error generating questions for chunk ${index}:`, error)
            return [] as Question[]
          })
      )

      const chunkResults = await Promise.all(chunkPromises)
      allQuestions = chunkResults.flat()

      // Deduplicate similar questions
      allQuestions = deduplicateQuestions(allQuestions, 0.6)
    }

    // Ensure we have the requested number of questions
    if (allQuestions.length < questionCount) {
      console.warn(`Only generated ${allQuestions.length} of ${questionCount} requested questions`)
    }

    // Trim to exact count if we have more
    if (allQuestions.length > questionCount) {
      allQuestions = allQuestions.slice(0, questionCount)
    }

    // Validate we have enough questions
    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate questions. Please try again with different content.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      questions: allQuestions,
      metadata: {
        totalCharacters: chunkResult.totalCharacters,
        chunksUsed: chunkResult.chunkCount,
        questionsGenerated: allQuestions.length,
      },
    })
  } catch (error: any) {
    console.error('Error processing PDF:', error)

    // More specific error messages
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'API configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Service is busy. Please try again in a few moments.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to process PDF. Please try again.' },
      { status: 500 }
    )
  }
}

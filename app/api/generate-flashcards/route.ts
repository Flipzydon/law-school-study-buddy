import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import type { Flashcard } from '@/types/flashcard'
import {
  checkRateLimit,
  checkCachedContent,
  getOptimalModel,
  getTemperature,
  withRetry,
  truncatePdfText
} from '@/lib/api-helpers'

export const runtime = 'nodejs'
export const maxDuration = 60

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function buildFlashcardPrompt(cardCount: number, difficulty: string): string {
  return `You are an expert Nigerian law school tutor creating study flashcards.

Generate exactly ${cardCount} flashcards from this legal text.
Difficulty Level: ${difficulty}

Mix these formats intelligently based on content:
1. **Question & Answer** - Test understanding with "What/How/Why" questions
2. **Term & Definition** - Legal vocabulary and doctrine names
3. **Case & Holding** - Case names with legal holdings and significance

Guidelines:
- Each flashcard tests ONE concept clearly
- Use Nigerian legal context and terminology
- Front side: concise question/term (max 2 lines)
- Back side: clear answer/explanation (2-4 sentences)
- Include the appropriate type for each card

Difficulty Guidelines:
- Basic: Straightforward recall, simple definitions
- Intermediate: Application of concepts, relationships between doctrines
- Advanced: Complex analysis, exceptions, edge cases, comparative law

Return a JSON array with this exact structure:
[
  {
    "front": "What is the doctrine of stare decisis?",
    "back": "The principle that courts follow precedent set by higher courts. In Nigeria, Supreme Court decisions bind all lower courts. This ensures consistency and predictability in legal rulings.",
    "type": "question",
    "difficulty": "${difficulty}"
  },
  {
    "front": "Obiter Dictum",
    "back": "A judge's statement made in passing, not essential to the decision. Unlike ratio decidendi, obiter dicta do not bind future courts but may have persuasive value.",
    "type": "term",
    "difficulty": "${difficulty}"
  }
]

Return ONLY valid JSON, no additional text or markdown.`
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to generate flashcards.' },
        { status: 401 }
      )
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(user.id)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString()
          }
        }
      )
    }

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get('pdf') as File
    const difficulty = (formData.get('difficulty') as string) || 'intermediate'
    const cardCount = parseInt(formData.get('cardCount') as string) || 30
    const skipCache = formData.get('skipCache') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided.' },
        { status: 400 }
      )
    }

    // Check for cached content (unless skipCache is true)
    if (!skipCache) {
      const cached = await checkCachedContent(user.id, file.name, 'flashcards', difficulty)
      if (cached) {
        console.log('[Flashcards] Using cached content for', file.name)
        return NextResponse.json({
          flashcards: cached.content_data.flashcards,
          metadata: {
            cardCount: cached.content_data.cardCount,
            difficulty: cached.content_data.difficulty,
            generatedAt: cached.created_at,
            pdfFilename: file.name,
            cached: true
          }
        })
      }
    }

    // Convert File to Buffer and extract text
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const pdfData = await pdfParse(buffer)
    const pdfText = pdfData.text

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text could be extracted from the PDF. Please ensure the PDF contains selectable text.' },
        { status: 400 }
      )
    }

    // Truncate text to first 10,000 characters
    const truncatedText = truncatePdfText(pdfText)

    // Generate flashcards with OpenAI (with retry logic)
    const systemPrompt = buildFlashcardPrompt(cardCount, difficulty)
    const model = getOptimalModel(difficulty)

    console.log(`[Flashcards] Generating with model: ${model}, difficulty: ${difficulty}`)

    const completion = await withRetry(
      () => openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Generate ${cardCount} flashcards based on this Nigerian law text:\n\n${truncatedText}`,
          },
        ],
        temperature: getTemperature(difficulty),
        max_tokens: Math.min(4000, cardCount * 150), // Cap at 4000 to stay within model limits
      }),
      { maxRetries: 2 }
    )

    const responseText = completion.choices[0]?.message?.content || ''

    // Parse JSON response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to generate flashcards. Please try again.' },
        { status: 500 }
      )
    }

    const rawFlashcards = JSON.parse(jsonMatch[0])

    // Validate and transform flashcards
    const flashcards: Flashcard[] = rawFlashcards.map((card: any, index: number) => {
      if (!card.front || !card.back) {
        throw new Error(`Invalid flashcard at index ${index}`)
      }
      return {
        id: `card-${Date.now()}-${index}`,
        front: card.front,
        back: card.back,
        type: card.type || 'question',
        difficulty: card.difficulty || difficulty,
        tags: card.tags || [],
      }
    })

    // Save to Supabase
    const contentData = {
      flashcards,
      difficulty,
      cardCount: flashcards.length,
    }

    const { error: saveError } = await supabase
      .from('generated_content')
      .insert({
        user_id: user.id,
        pdf_filename: file.name,
        content_type: 'flashcards',
        content_data: contentData,
      })

    if (saveError) {
      console.error('Error saving flashcards to database:', saveError)
      // Still return flashcards even if save fails
    }

    return NextResponse.json({
      flashcards,
      metadata: {
        cardCount: flashcards.length,
        difficulty,
        generatedAt: new Date().toISOString(),
        pdfFilename: file.name,
      },
    })
  } catch (error: any) {
    console.error('Error generating flashcards:', error)

    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Configuration error. Contact support.' },
        { status: 500 }
      )
    }

    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Service is busy. Please try again.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate flashcards. Please try again.' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import {
  checkRateLimit,
  checkCachedContent,
  getOptimalModel,
  getTemperature,
  withRetry,
  truncatePdfText,
  estimateWordCount,
  estimateAudioDuration
} from '@/lib/api-helpers'

export const runtime = 'nodejs'
export const maxDuration = 120

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// OpenAI TTS has a 4096 character limit, so we need to chunk longer scripts
const TTS_MAX_CHARS = 4000 // Leave some margin

function splitTextIntoChunks(text: string, maxLength: number): string[] {
  const chunks: string[] = []
  let remaining = text.trim()

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining)
      break
    }

    // Find the best split point (end of sentence) within the limit
    let splitIndex = maxLength

    // Look for the last sentence ending (. ! ?) within the chunk
    const chunk = remaining.slice(0, maxLength)

    // Find last occurrence of sentence-ending punctuation followed by space
    let lastSentenceEnd = -1
    for (let i = chunk.length - 1; i >= maxLength - 500 && i >= 0; i--) {
      const char = chunk[i]
      if ((char === '.' || char === '!' || char === '?') &&
          (i === chunk.length - 1 || chunk[i + 1] === ' ' || chunk[i + 1] === '\n')) {
        lastSentenceEnd = i + 1
        break
      }
    }

    if (lastSentenceEnd > maxLength / 2) {
      splitIndex = lastSentenceEnd
    } else {
      // Fallback: split at last space
      const lastSpace = remaining.lastIndexOf(' ', maxLength)
      if (lastSpace > maxLength / 2) {
        splitIndex = lastSpace
      }
    }

    chunks.push(remaining.slice(0, splitIndex).trim())
    remaining = remaining.slice(splitIndex).trim()
  }

  return chunks
}

function buildPodcastPrompt(difficulty: string): string {
  return `You are a Nigerian law professor creating an engaging audio summary for law students.

Create a ${difficulty}-level podcast script (single narrator) summarizing this legal material.

Style: Conversational but informative - like explaining concepts to a study partner over coffee.
Length: 5-8 minutes when spoken aloud (approximately 800-1200 words).
Tone: Clear, encouraging, accessible - help students understand, not intimidate them.

Structure:
1. **Introduction** (10%): Brief hook about why this topic matters in Nigerian legal practice
2. **Key Concepts** (70%): Explain main ideas, doctrines, and principles clearly
3. **Examples** (15%): Use Nigerian cases or practical scenarios to illustrate
4. **Conclusion** (5%): Quick recap of main takeaways

Difficulty Guidelines:
- Basic: Simpler language, focus on core concepts, more examples
- Intermediate: Balanced technical and accessible language, connect concepts
- Advanced: In-depth analysis, nuances, exceptions, comparative perspectives

Important:
- Use natural speech patterns (contractions, rhetorical questions)
- Include transitions like "Now, let's turn to...", "Here's the key point..."
- Reference Nigerian laws, statutes, and cases where relevant
- Make it engaging - students will listen to this while commuting/exercising
- Do NOT include any formatting markers, headers, or section labels
- Write as continuous spoken text ready to be read aloud

Return ONLY the script text - no JSON, no special formatting, just the narration ready to be read aloud.

Begin the script now:`
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to generate podcasts.' },
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
    const skipCache = formData.get('skipCache') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided.' },
        { status: 400 }
      )
    }

    // Check for cached content (unless skipCache is true)
    // Note: For podcasts, we cache the script and audio URL
    if (!skipCache) {
      const cached = await checkCachedContent(user.id, file.name, 'podcast', difficulty)
      if (cached && cached.content_data.audioUrl) {
        console.log('[Podcast] Using cached content for', file.name)
        return NextResponse.json({
          script: cached.content_data.script,
          audioUrl: cached.content_data.audioUrl,
          duration: cached.content_data.duration,
          metadata: {
            difficulty: cached.content_data.difficulty,
            voiceUsed: cached.content_data.voiceUsed,
            wordCount: estimateWordCount(cached.content_data.script),
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

    // Truncate text using helper
    const truncatedText = truncatePdfText(pdfText)

    // Step 1: Generate podcast script with optimal model
    const systemPrompt = buildPodcastPrompt(difficulty)
    const model = getOptimalModel(difficulty)

    console.log(`[Podcast] Generating script with model: ${model}, difficulty: ${difficulty}`)

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
            content: `Create a podcast script based on this Nigerian law text:\n\n${truncatedText}`,
          },
        ],
        temperature: getTemperature(difficulty),
        max_tokens: 2000,
      }),
      { maxRetries: 2 }
    )

    const script = completion.choices[0]?.message?.content || ''

    if (!script || script.trim().length < 100) {
      return NextResponse.json(
        { error: 'Failed to generate podcast script. Please try again.' },
        { status: 500 }
      )
    }

    // Step 2: Convert script to audio using OpenAI TTS (with chunking for long scripts)
    const scriptChunks = splitTextIntoChunks(script, TTS_MAX_CHARS)
    const audioBuffers: Buffer[] = []

    for (const chunk of scriptChunks) {
      const audioResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova',
        input: chunk,
        speed: 1.0,
        response_format: 'mp3',
      })

      const chunkArrayBuffer = await audioResponse.arrayBuffer()
      audioBuffers.push(Buffer.from(chunkArrayBuffer))
    }

    // Concatenate all audio buffers
    const audioBuffer = Buffer.concat(audioBuffers)

    // Step 3: Upload audio to Supabase Storage
    const timestamp = Date.now()
    const fileName = `${user.id}/${timestamp}_podcast.mp3`

    const { error: uploadError } = await supabase.storage
      .from('podcast-audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading podcast to storage:', uploadError)
      // Continue without storage - return script anyway
    }

    // Generate signed URL (valid for 1 hour)
    let audioUrl = ''
    if (!uploadError) {
      const { data: urlData } = await supabase.storage
        .from('podcast-audio')
        .createSignedUrl(fileName, 3600)
      audioUrl = urlData?.signedUrl || ''
    }

    // Estimate duration (rough: ~150 words per minute for natural speech)
    const wordCount = script.split(/\s+/).length
    const estimatedDuration = Math.round((wordCount / 150) * 60) // in seconds

    // Step 4: Save to database
    const contentData = {
      script,
      audioUrl,
      duration: estimatedDuration,
      difficulty,
      voiceUsed: 'nova',
    }

    const { error: saveError } = await supabase
      .from('generated_content')
      .insert({
        user_id: user.id,
        pdf_filename: file.name,
        content_type: 'podcast',
        content_data: contentData,
      })

    if (saveError) {
      console.error('Error saving podcast to database:', saveError)
    }

    return NextResponse.json({
      script,
      audioUrl,
      duration: estimatedDuration,
      metadata: {
        difficulty,
        voiceUsed: 'nova',
        wordCount,
        generatedAt: new Date().toISOString(),
        pdfFilename: file.name,
      },
    })
  } catch (error: any) {
    console.error('Error generating podcast:', error)

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
      { error: error.message || 'Failed to generate podcast. Please try again.' },
      { status: 500 }
    )
  }
}

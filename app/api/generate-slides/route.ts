import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import OpenAI from 'openai'
import { jsPDF } from 'jspdf'
import { createClient } from '@/lib/supabase/server'
import type { Slide } from '@/types/slides'
import {
  checkRateLimit,
  checkCachedContent,
  getOptimalModel,
  getTemperature,
  withRetry,
  truncatePdfText
} from '@/lib/api-helpers'

export const runtime = 'nodejs'
export const maxDuration = 120

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function buildSlidesPrompt(difficulty: string): string {
  return `You are creating presentation slides for Nigerian law students.

Analyze this legal material and create an appropriate number of slides (typically 10-25 based on content depth and complexity).
Difficulty Level: ${difficulty}

Slide Design Principles:
- Each slide: One main idea
- Title: Clear, descriptive (max 8 words)
- Content: 3-5 bullet points per slide
- Bullets: Concise phrases, not full sentences
- Include key cases/statutes as references

Difficulty Guidelines:
- Basic: Fewer slides (10-15), core concepts only, simple explanations
- Intermediate: Moderate slides (15-20), balanced detail, some analysis
- Advanced: More slides (20-25), comprehensive coverage, nuances and exceptions

Slide Types to Include:
1. Title slide (topic overview)
2. Agenda/outline slide
3. Definition/concept slides
4. Case law slides (key holdings)
5. Practical application slides
6. Summary/key takeaways slide

Return a JSON array of slides:
[
  {
    "title": "Introduction to Constitutional Law",
    "bullets": [
      "Foundation of Nigerian legal system",
      "Supreme law of the land - 1999 Constitution",
      "Establishes government structure and fundamental rights"
    ],
    "footer": "Nigerian Constitution 1999 (as amended)"
  },
  {
    "title": "Fundamental Rights Overview",
    "bullets": [
      "Chapter IV of the Constitution",
      "Right to life, dignity, personal liberty",
      "Freedom of expression and association",
      "Right to fair hearing"
    ],
    "footer": "Sections 33-46, Constitution 1999"
  }
]

Return ONLY valid JSON, no additional text.`
}

function generatePDF(slides: Slide[], title: string): Buffer {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)

  slides.forEach((slide, index) => {
    if (index > 0) {
      doc.addPage()
    }

    // Background gradient effect (light blue header area)
    doc.setFillColor(59, 130, 246) // primary-500 blue
    doc.rect(0, 0, pageWidth, 45, 'F')

    // Slide number
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text(`${index + 1} / ${slides.length}`, pageWidth - margin, 10)

    // Title
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text(slide.title, margin, 30, { maxWidth: contentWidth })

    // Reset text color for content
    doc.setTextColor(30, 41, 59) // slate-800
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(16)

    // Bullets
    let yPosition = 65
    const lineHeight = 12
    const bulletIndent = 8

    slide.bullets.forEach((bullet) => {
      // Bullet point
      doc.setFillColor(59, 130, 246)
      doc.circle(margin + 3, yPosition - 2, 2, 'F')

      // Bullet text - handle long text
      const lines = doc.splitTextToSize(bullet, contentWidth - bulletIndent - 10)
      lines.forEach((line: string, lineIndex: number) => {
        doc.text(line, margin + bulletIndent, yPosition + (lineIndex * lineHeight))
      })
      yPosition += lines.length * lineHeight + 4
    })

    // Footer
    if (slide.footer) {
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139) // slate-500
      doc.text(slide.footer, margin, pageHeight - 15)
    }

    // Document title in footer
    doc.setFontSize(8)
    doc.text(title, pageWidth - margin - doc.getTextWidth(title), pageHeight - 15)
  })

  // Return as buffer
  const pdfOutput = doc.output('arraybuffer')
  return Buffer.from(pdfOutput)
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to generate slides.' },
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
    if (!skipCache) {
      const cached = await checkCachedContent(user.id, file.name, 'slides', difficulty)
      if (cached && cached.content_data.slides) {
        console.log('[Slides] Using cached content for', file.name)
        return NextResponse.json({
          slides: cached.content_data.slides,
          slidesUrl: cached.content_data.slidesUrl,
          slideCount: cached.content_data.slideCount,
          metadata: {
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

    // Truncate text using helper
    const truncatedText = truncatePdfText(pdfText)

    // Generate slides content with optimal model
    const systemPrompt = buildSlidesPrompt(difficulty)
    const model = getOptimalModel(difficulty)

    console.log(`[Slides] Generating with model: ${model}, difficulty: ${difficulty}`)

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
            content: `Create presentation slides based on this Nigerian law text:\n\n${truncatedText}`,
          },
        ],
        temperature: getTemperature(difficulty),
        max_tokens: 4000,
      }),
      { maxRetries: 2 }
    )

    const responseText = completion.choices[0]?.message?.content || ''

    // Parse JSON response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to generate slides. Please try again.' },
        { status: 500 }
      )
    }

    const slides: Slide[] = JSON.parse(jsonMatch[0])

    // Validate slides
    if (!Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json(
        { error: 'No slides were generated. Please try again.' },
        { status: 500 }
      )
    }

    // Generate PDF
    const pdfTitle = file.name.replace('.pdf', '')
    const pdfBuffer = generatePDF(slides, pdfTitle)

    // Upload to Supabase Storage
    const timestamp = Date.now()
    const fileName = `${user.id}/${timestamp}_slides.pdf`

    const { error: uploadError } = await supabase.storage
      .from('presentation-slides')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading slides to storage:', uploadError)
      // Continue without storage - return slides data anyway
    }

    // Generate signed URL (valid for 1 hour)
    let slidesUrl = ''
    if (!uploadError) {
      const { data: urlData } = await supabase.storage
        .from('presentation-slides')
        .createSignedUrl(fileName, 3600)
      slidesUrl = urlData?.signedUrl || ''
    }

    // Save to database
    const contentData = {
      slides,
      slideCount: slides.length,
      difficulty,
      slidesUrl,
    }

    const { error: saveError } = await supabase
      .from('generated_content')
      .insert({
        user_id: user.id,
        pdf_filename: file.name,
        content_type: 'slides',
        content_data: contentData,
      })

    if (saveError) {
      console.error('Error saving slides to database:', saveError)
    }

    return NextResponse.json({
      slides,
      slidesUrl,
      slideCount: slides.length,
      metadata: {
        difficulty,
        generatedAt: new Date().toISOString(),
        pdfFilename: file.name,
      },
    })
  } catch (error: any) {
    console.error('Error generating slides:', error)

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
      { error: error.message || 'Failed to generate slides. Please try again.' },
      { status: 500 }
    )
  }
}

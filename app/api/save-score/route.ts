import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentName, score, totalQuestions, percentage, pdfFilename } = body

    if (typeof score !== 'number' || typeof totalQuestions !== 'number') {
      return NextResponse.json(
        { error: 'Invalid score data' },
        { status: 400 }
      )
    }

    // Insert score into Supabase
    const { data, error } = await supabaseAdmin
      .from('scores')
      .insert([
        {
          student_name: studentName || 'Anonymous',
          score,
          total_questions: totalQuestions,
          percentage: parseFloat(percentage),
          pdf_filename: pdfFilename || 'Unknown',
        },
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save score to database' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error saving score:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save score' },
      { status: 500 }
    )
  }
}


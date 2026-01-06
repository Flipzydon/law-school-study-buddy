# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 14 App Router application that generates law school quiz questions from uploaded PDFs using OpenAI.

### Data Flow

1. User uploads PDF via `PDFUpload` component
2. `POST /api/process-pdf` extracts text with pdf-parse, sends to GPT-4 Turbo, returns 10 MCQ questions
3. `Quiz` component renders questions, tracks answers, calculates score
4. `POST /api/save-score` stores results in Supabase `scores` table

### Key Constraints

- PDF text is truncated to first 10,000 characters before sending to OpenAI
- API route uses `runtime = 'nodejs'` and `maxDuration = 60` for PDF processing
- Questions must return exactly 10 items with 4 options each and a correctAnswer index (0-3)
- Supabase has two clients: `supabase` (anon key) and `supabaseAdmin` (service role key)

### Styling

Tailwind CSS with custom `primary` color palette (blue, defined in tailwind.config.ts). Components use `primary-500`, `primary-600`, etc.

## Environment Variables

Required in `.env.local`:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

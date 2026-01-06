# Nigerian Law School Study Buddy

A Next.js application that helps Nigerian law school students study by generating practice questions from PDF materials using OpenAI's API.

## Features

- 📄 Upload PDF files containing law school materials
- 🤖 AI-powered question generation using OpenAI GPT-4
- 📝 Interactive quiz interface with 10 multiple-choice questions
- 💾 Score tracking stored in Supabase
- 📊 Detailed results review with correct/incorrect answers
- 🎨 Modern, responsive UI designed for law students

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Set up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL migration file located at `lib/supabase-migrations.sql` to create the `scores` table

### 4. Get OpenAI API Key

1. Sign up for an account at [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys section
3. Create a new API key
4. Add it to your `.env.local` file

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. **Upload PDF**: Click "Upload a file" or drag and drop a PDF file containing law school materials
2. **Generate Questions**: Click "Generate Questions" to process the PDF and create 10 multiple-choice questions
3. **Take Quiz**: Answer all 10 questions at your own pace, navigating with Previous/Next buttons
4. **Submit**: Review your answers and click "Submit Quiz" when ready
5. **View Results**: See your score, percentage, and detailed review of correct/incorrect answers
6. **Save Score**: Optionally enter your name and your score will be saved to the database

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4 Turbo
- **Database**: Supabase (PostgreSQL)
- **PDF Parsing**: pdf-parse

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── process-pdf/     # API route for PDF processing and question generation
│   │   └── save-score/      # API route for saving scores to Supabase
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── PDFUpload.tsx        # PDF upload component
│   └── Quiz.tsx             # Quiz interface component
├── lib/
│   ├── supabase.ts          # Supabase client configuration
│   └── supabase-migrations.sql  # Database schema
└── package.json
```

## Notes

- PDF files are limited to 10MB
- Only the first 10,000 characters of PDF text are used to generate questions
- Questions are generated specifically for Nigerian law school context
- All scores are stored in Supabase for future analytics

## License

MIT


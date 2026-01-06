# Flashcards, Podcast & Slides Features - Design Document

**Date:** January 5, 2026
**Status:** Approved
**Approach:** OpenAI for Everything (Approach 1)

## Overview

This design adds three new study features to the Law School Study Buddy application:
1. **Flashcard Generation** - AI-generated flashcards with mixed formats (Q&A, term/definition, case law)
2. **Podcast Summary** - Text script + audio narration of PDF content
3. **Slide Presentations** - PDF slide decks for study/review

All features use OpenAI GPT-4 Turbo for content generation and OpenAI TTS for audio.

---

## 1. Architecture Overview

### Current System
- Next.js 14 App Router application
- PDF upload → text extraction → OpenAI GPT-4 → quiz generation
- Scores stored in Supabase
- No authentication currently

### New System Architecture

**Authentication Flow:**
- Users sign up/login with email + password (Supabase Auth)
- Session persists across page refreshes
- Generated content tied to user account
- Logout clears session and cached content

**Updated Data Flow:**
1. User logs in → Supabase creates session
2. User uploads PDF → extracts text (stored temporarily in state)
3. User sees 4 generation buttons:
   - 🎯 Generate Quiz (existing)
   - 🗂️ Generate Flashcards (new)
   - 🎙️ Generate Podcast (new)
   - 📊 Generate Slides (new)
4. Each button triggers separate API route
5. Content generated via OpenAI → saved to Supabase database
6. User can view/download content anytime while logged in
7. Logout → clears session and localStorage

**Component Structure:**
```
app/
├─ page.tsx (main landing/upload)
├─ login/page.tsx (new)
├─ signup/page.tsx (new)
├─ library/page.tsx (new - content library)
components/
├─ PDFUpload.tsx (updated - shows 4 buttons)
├─ Quiz.tsx (existing)
├─ FlashcardViewer.tsx (new)
├─ PodcastPlayer.tsx (new)
├─ SlidesViewer.tsx (new)
├─ ContentLibrary.tsx (new)
├─ AuthProvider.tsx (new)
├─ LoginForm.tsx (new)
└─ SignupForm.tsx (new)
```

**Storage Strategy:**
- Generated content saved to Supabase database on creation
- Audio/PDF files stored in Supabase Storage buckets
- LocalStorage used only for temporary caching (performance)
- On logout: clear localStorage, invalidate session

---

## 2. API Routes & Endpoints

### New Routes

**`/api/generate-flashcards` (POST)**
- **Authentication:** Required
- **Input:**
  ```typescript
  {
    pdfText: string,
    difficulty: 'basic' | 'intermediate' | 'advanced',
    cardCount: 15 | 30 | 45,
    pdfFilename: string
  }
  ```
- **Process:**
  1. Validate user session
  2. Send text + config to GPT-4 Turbo with flashcard prompt
  3. Parse JSON response into flashcard array
  4. Save to `generated_content` table in Supabase
- **Output:**
  ```typescript
  {
    flashcards: Flashcard[],
    metadata: {
      cardCount: number,
      difficulty: string,
      generatedAt: string
    }
  }
  ```

**`/api/generate-podcast` (POST)**
- **Authentication:** Required
- **Input:**
  ```typescript
  {
    pdfText: string,
    difficulty: 'basic' | 'intermediate' | 'advanced',
    pdfFilename: string
  }
  ```
- **Process:**
  1. Validate user session
  2. Generate script with GPT-4 Turbo (single narrator, conversational)
  3. Send script to OpenAI TTS API (voice: "nova")
  4. Store audio MP3 in Supabase Storage `podcast-audio` bucket
  5. Save script + audio URL to `generated_content` table
- **Output:**
  ```typescript
  {
    script: string,
    audioUrl: string,
    duration: number, // seconds
    metadata: { ... }
  }
  ```

**`/api/generate-slides` (POST)**
- **Authentication:** Required
- **Input:**
  ```typescript
  {
    pdfText: string,
    difficulty: 'basic' | 'intermediate' | 'advanced',
    pdfFilename: string
  }
  ```
- **Process:**
  1. Validate user session
  2. Generate slide outline/content with GPT-4 Turbo (AI decides slide count)
  3. Use `jsPDF` to create PDF with slides
  4. Store PDF in Supabase Storage `presentation-slides` bucket
  5. Save metadata to `generated_content` table
- **Output:**
  ```typescript
  {
    slidesUrl: string,
    slideCount: number,
    metadata: { ... }
  }
  ```

### Authentication Middleware
- All new routes check for valid Supabase session
- Return 401 Unauthorized if not logged in
- User ID extracted from session for database operations

### Error Handling
- OpenAI rate limits → "Service is busy. Please try again."
- API key errors → "Configuration error. Contact support."
- Storage errors → "Failed to save content. Try again."
- Parsing errors → "Failed to generate content. Try again."
- Consistent error message format across all routes

---

## 3. Data Structures & TypeScript Types

### New Type Files

**types/flashcard.ts:**
```typescript
export interface Flashcard {
  id: string
  front: string  // Question, term, or case name
  back: string   // Answer, definition, or holding
  type: 'question' | 'term' | 'case'  // AI chooses based on content
  difficulty?: 'basic' | 'intermediate' | 'advanced'
  tags?: string[]  // Optional legal topic tags
}

export interface FlashcardSet {
  id: string
  userId: string
  pdfFilename: string
  flashcards: Flashcard[]
  difficulty: 'basic' | 'intermediate' | 'advanced'
  cardCount: 15 | 30 | 45
  createdAt: string
}
```

**types/podcast.ts:**
```typescript
export interface Podcast {
  id: string
  userId: string
  pdfFilename: string
  script: string  // Full transcript
  audioUrl: string  // Supabase Storage signed URL
  duration: number  // Audio duration in seconds
  difficulty: 'basic' | 'intermediate' | 'advanced'
  voiceUsed: string  // e.g., "nova"
  createdAt: string
}
```

**types/slides.ts:**
```typescript
export interface SlidePresentation {
  id: string
  userId: string
  pdfFilename: string
  slidesUrl: string  // PDF URL in Supabase Storage
  slideCount: number  // AI-determined count
  difficulty: 'basic' | 'intermediate' | 'advanced'
  createdAt: string
}
```

### Supabase Database Schema

**`generated_content` table:**
```sql
CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pdf_filename TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'flashcards' | 'podcast' | 'slides'
  content_data JSONB NOT NULL,  -- Stores the full typed object
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for performance
  INDEX idx_user_content (user_id, content_type),
  INDEX idx_created_at (created_at DESC)
);
```

**Row Level Security (RLS) Policies:**
```sql
-- Users can only read their own content
CREATE POLICY "Users can view own content"
  ON generated_content FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own content
CREATE POLICY "Users can insert own content"
  ON generated_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own content
CREATE POLICY "Users can delete own content"
  ON generated_content FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 4. Frontend Components & UI

### Updated PDFUpload Component

After successful PDF upload, display generation options:

```
┌──────────────────────────────────────────┐
│  ✅ Constitutional_Law.pdf uploaded      │
│  (12 pages, 8,450 characters)            │
│                                          │
│  Choose what to generate:                │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 🎯 Generate Quiz                   │ │
│  │ Configure: 10 questions, Practice  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 🗂️ Generate Flashcards             │ │
│  │ Configure: 30 cards               │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 🎙️ Generate Podcast                │ │
│  │ Script + Audio narration           │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 📊 Generate Slides                 │ │
│  │ PDF presentation                   │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Difficulty: ● Basic ○ Intermediate    │
│              ○ Advanced                 │
└──────────────────────────────────────────┘
```

### FlashcardViewer Component

**Features:**
- Card flip animation (framer-motion)
- Front/back toggle with smooth transition
- Navigation: Previous/Next buttons + keyboard shortcuts
- Progress indicator: "Card 12/30"
- Shuffle mode toggle
- Filter by type (Question/Term/Case)
- Mark cards as "mastered" (visual checkmark)
- Download options:
  - JSON format
  - CSV format (Anki-compatible)
  - Print view

**Layout:**
```
┌────────────────────────────────────┐
│  Flashcards: Constitutional_Law    │
│  Card 12/30  [Shuffle] [Filter ▼]  │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐ │
│  │                              │ │
│  │  What is the doctrine of     │ │
│  │  stare decisis in Nigerian   │ │
│  │  law?                        │ │
│  │                              │ │
│  │  [Click to flip]             │ │
│  │                              │ │
│  └──────────────────────────────┘ │
│                                    │
│  [← Previous]  [✓ Master]  [Next →]│
│                                    │
│  [Download ▼]                      │
└────────────────────────────────────┘
```

### PodcastPlayer Component

**Features:**
- HTML5 audio player with custom controls
- Play/pause, seek bar, volume control
- Playback speed (0.75x, 1x, 1.25x, 1.5x, 2x)
- Display script below player
- Scrollable transcript
- Download buttons:
  - "Download Audio (MP3)"
  - "Download Script (TXT)"
- Optional: timestamp markers for sections

**Layout:**
```
┌────────────────────────────────────┐
│  Podcast: Constitutional_Law       │
├────────────────────────────────────┤
│  🔊 ━━━━━━━━●────────  3:24 / 8:15 │
│     ⏮ ⏯ ⏭  [1.0x ▼]  🔊 ▃▃▃▃▃▅▇  │
├────────────────────────────────────┤
│  Transcript:                       │
│  ┌──────────────────────────────┐ │
│  │ Welcome to this summary of   │ │
│  │ Nigerian constitutional law. │ │
│  │ Today we'll explore the key  │ │
│  │ principles of...             │ │
│  │                              │ │
│  └──────────────────────────────┘ │
│                                    │
│  [📥 Download Audio]               │
│  [📄 Download Script]              │
└────────────────────────────────────┘
```

### SlidesViewer Component

**Features:**
- PDF preview using `react-pdf` or iframe
- Page navigation (1/15)
- Thumbnail sidebar (optional)
- Fullscreen mode
- Zoom controls
- Download button: "Download PDF"

**Layout:**
```
┌────────────────────────────────────┐
│  Slides: Constitutional_Law        │
│  Page 5/15    [Fullscreen] [Zoom ▼]│
├────────────────────────────────────┤
│  ┌──────────────────────────────┐ │
│  │                              │ │
│  │  [PDF Slide Preview]         │ │
│  │                              │ │
│  └──────────────────────────────┘ │
│                                    │
│  [← Prev]  [5/15]  [Next →]       │
│                                    │
│  [📥 Download PDF]                 │
└────────────────────────────────────┘
```

### ContentLibrary Component (New Page)

**Features:**
- Dashboard showing all user's generated content
- Tabs: All / Quizzes / Flashcards / Podcasts / Slides
- Sort by: Date (newest first), Name, Type
- Search/filter by PDF filename
- Quick actions: View, Download, Delete
- Empty state when no content

---

## 5. OpenAI Integration & Prompts

### Flashcard Generation Prompt

```typescript
const flashcardPrompt = `You are an expert Nigerian law school tutor creating study flashcards.

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

Return ONLY valid JSON, no additional text or markdown.`;
```

### Podcast Script Generation Prompt

```typescript
const podcastPrompt = `You are a Nigerian law professor creating an engaging audio summary for law students.

Create a ${difficulty}-level podcast script (single narrator) summarizing this legal material.

Style: Conversational but informative - like explaining concepts to a study partner over coffee.
Length: 5-10 minutes when spoken aloud (approximately 800-1500 words).
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

Return ONLY the script text - no JSON, no special formatting, just the narration ready to be read aloud.

Begin the script now:`;
```

### Slides Generation Prompt

```typescript
const slidesPrompt = `You are creating presentation slides for Nigerian law students.

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

Return ONLY valid JSON, no additional text.`;
```

### OpenAI API Integration

**GPT-4 Turbo Call (Content Generation):**
```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    {
      role: 'system',
      content: systemPrompt // One of the prompts above
    },
    {
      role: 'user',
      content: `Generate content based on this Nigerian law text:\n\n${pdfText}`
    }
  ],
  temperature: difficulty === 'basic' ? 0.5 : difficulty === 'advanced' ? 0.8 : 0.7,
  max_tokens: 4000,
  response_format: { type: "json_object" } // For flashcards and slides
})
```

**OpenAI TTS Call (Podcast Audio):**
```typescript
const audioFile = await openai.audio.speech.create({
  model: "tts-1",  // Standard quality (cheaper) - "tts-1-hd" for higher quality
  voice: "nova",   // Female voice, clear and professional
  input: podcastScript,
  speed: 1.0,      // Normal speed
  response_format: "mp3"
})

// Convert to buffer for upload
const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
```

**Available TTS Voices:**
- `alloy` - Neutral
- `echo` - Male, warm
- `fable` - British accent
- `onyx` - Male, deep
- `nova` - Female, clear (recommended)
- `shimmer` - Female, warm

---

## 6. Authentication Implementation (Supabase Auth)

### Setup Steps

1. **Enable Email Auth in Supabase Dashboard:**
   - Go to Authentication → Settings
   - Enable Email provider
   - Configure email templates (confirmation, password reset)
   - Set Site URL and redirect URLs

2. **Install Supabase Auth Helpers:**
   ```bash
   npm install @supabase/auth-helpers-nextjs
   ```

### Auth Provider (Context)

**components/AuthProvider.tsx:**
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    })
    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
  }

  const signOut = async () => {
    // Clear localStorage first
    localStorage.clear()

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### Login & Signup Forms

**components/LoginForm.tsx:**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signIn(email, password)
      router.push('/') // Redirect to home
    } catch (err: any) {
      setError(err.message || 'Failed to log in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card variant="glass" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold">Log In</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <Button type="submit" variant="nigerian" fullWidth disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </Button>

        <p className="text-center text-sm">
          Don't have an account?{' '}
          <a href="/signup" className="text-nigerian-600 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </Card>
  )
}
```

**components/SignupForm.tsx:** (Similar structure with name field)

### Protected Routes

**middleware.ts:**
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedPaths = ['/library', '/']
  const isProtected = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

  if (isProtected && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect logged-in users away from auth pages
  if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup') && session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/', '/login', '/signup', '/library/:path*']
}
```

### UI Updates

**Header Component Updates:**
- Show "Login" / "Sign Up" buttons when not authenticated
- Show user name + "Logout" button when authenticated
- Add user avatar/icon

---

## 7. File Storage & Download Functionality

### Supabase Storage Setup

**Create Storage Buckets:**

1. **`podcast-audio`** bucket:
   - Public: No (requires authentication)
   - File size limit: 50 MB
   - Allowed MIME types: `audio/mpeg`

2. **`presentation-slides`** bucket:
   - Public: No (requires authentication)
   - File size limit: 20 MB
   - Allowed MIME types: `application/pdf`

**Row Level Security (RLS) for Storage:**

```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('podcast-audio', 'presentation-slides')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own files
CREATE POLICY "Users can read own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id IN ('podcast-audio', 'presentation-slides')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('podcast-audio', 'presentation-slides')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

### Upload Flow

**Podcast Audio Upload:**
```typescript
// In /api/generate-podcast route
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// After generating audio with OpenAI TTS
const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
const supabase = createRouteHandlerClient({ cookies })

// Get user session
const { data: { session } } = await supabase.auth.getSession()
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const userId = session.user.id
const timestamp = Date.now()
const fileName = `${userId}/${timestamp}_podcast.mp3`

// Upload to storage
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('podcast-audio')
  .upload(fileName, audioBuffer, {
    contentType: 'audio/mpeg',
    upsert: false
  })

if (uploadError) throw uploadError

// Generate signed URL (valid for 1 hour)
const { data: urlData } = await supabase.storage
  .from('podcast-audio')
  .createSignedUrl(fileName, 3600)

const audioUrl = urlData.signedUrl
```

**Slides PDF Upload:**
```typescript
// After generating PDF with jsPDF
const pdfBlob = doc.output('blob')
const fileName = `${userId}/${timestamp}_slides.pdf`

const { data: uploadData, error: uploadError } = await supabase.storage
  .from('presentation-slides')
  .upload(fileName, pdfBlob, {
    contentType: 'application/pdf',
    upsert: false
  })

if (uploadError) throw uploadError

const { data: urlData } = await supabase.storage
  .from('presentation-slides')
  .createSignedUrl(fileName, 3600)

const slidesUrl = urlData.signedUrl
```

### Download Functionality

**Client-Side Download Helper:**
```typescript
// lib/downloadHelpers.ts
export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  downloadFile(url, filename)
  URL.revokeObjectURL(url)
}
```

**Flashcard Download (JSON/CSV):**
```typescript
export const downloadFlashcards = (
  flashcards: Flashcard[],
  format: 'json' | 'csv',
  filename: string
) => {
  let content: string
  let mimeType: string
  let extension: string

  if (format === 'json') {
    content = JSON.stringify(flashcards, null, 2)
    mimeType = 'application/json'
    extension = 'json'
  } else {
    // CSV format (Anki-compatible)
    const headers = 'Front,Back,Type,Difficulty\n'
    const rows = flashcards.map(f =>
      `"${f.front.replace(/"/g, '""')}","${f.back.replace(/"/g, '""')}","${f.type}","${f.difficulty}"`
    ).join('\n')
    content = headers + rows
    mimeType = 'text/csv'
    extension = 'csv'
  }

  const blob = new Blob([content], { type: mimeType })
  downloadBlob(blob, `${filename}_flashcards.${extension}`)
}
```

**Usage in Components:**
```typescript
// In PodcastPlayer component
<Button onClick={() => downloadFile(audioUrl, `${pdfFilename}_podcast.mp3`)}>
  📥 Download Audio
</Button>

<Button onClick={() => {
  const blob = new Blob([script], { type: 'text/plain' })
  downloadBlob(blob, `${pdfFilename}_script.txt`)
}}>
  📄 Download Script
</Button>

// In FlashcardViewer component
<Button onClick={() => downloadFlashcards(flashcards, 'json', pdfFilename)}>
  Download as JSON
</Button>

<Button onClick={() => downloadFlashcards(flashcards, 'csv', pdfFilename)}>
  Download as CSV (Anki)
</Button>
```

---

## 8. Error Handling & Loading States

### Loading States

**Multi-Step Progress Indicators:**

```typescript
// State for tracking generation progress
interface GenerationState {
  status: 'idle' | 'loading' | 'success' | 'error'
  step?: string
  progress?: number
}

const [flashcardsState, setFlashcardsState] = useState<GenerationState>({ status: 'idle' })
const [podcastState, setPodcastState] = useState<GenerationState>({ status: 'idle' })
const [slidesState, setSlidesState] = useState<GenerationState>({ status: 'idle' })
```

**Podcast Generation (Most Complex - 4 Steps):**
```typescript
const generatePodcast = async () => {
  setPodcastState({ status: 'loading', step: 'Analyzing PDF content...', progress: 25 })

  try {
    const response = await fetch('/api/generate-podcast', {
      method: 'POST',
      body: JSON.stringify({ pdfText, difficulty, pdfFilename }),
      headers: { 'Content-Type': 'application/json' }
    })

    // Server sends progress updates via streaming (optional enhancement)
    // For now, simulate steps on client

    setPodcastState({ status: 'loading', step: 'Generating script...', progress: 50 })
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate

    setPodcastState({ status: 'loading', step: 'Converting to audio...', progress: 75 })
    await new Promise(resolve => setTimeout(resolve, 2000))

    setPodcastState({ status: 'loading', step: 'Finalizing...', progress: 90 })

    const data = await response.json()

    if (!response.ok) throw new Error(data.error)

    setPodcastState({ status: 'success', progress: 100 })
    setPodcast(data)

  } catch (error) {
    setPodcastState({
      status: 'error',
      step: error.message || 'Failed to generate podcast'
    })
  }
}
```

**UI Display:**
```typescript
{podcastState.status === 'loading' && (
  <div className="flex flex-col items-center gap-3 p-6">
    <Spinner size="lg" />
    <div className="text-center">
      <p className="font-medium">{podcastState.step}</p>
      <p className="text-sm text-gray-500 mt-1">
        This may take 30-60 seconds
      </p>
    </div>
    <Progress value={podcastState.progress || 0} max={100} />
  </div>
)}

{podcastState.status === 'success' && (
  <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
    <CheckCircle className="text-green-600" />
    <span className="text-green-800">Podcast generated successfully!</span>
  </div>
)}

{podcastState.status === 'error' && (
  <div className="flex flex-col gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-800">{podcastState.step}</p>
    <Button onClick={() => generatePodcast()} variant="outline" size="sm">
      Try Again
    </Button>
  </div>
)}
```

### Error Handling

**API Route Error Patterns:**

```typescript
// /api/generate-flashcards/route.ts
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Please log in to generate flashcards.' },
        { status: 401 }
      )
    }

    // 2. Validate input
    const body = await request.json()
    if (!body.pdfText || !body.difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      )
    }

    // 3. Call OpenAI
    const completion = await openai.chat.completions.create({...})

  } catch (error: any) {
    console.error('Error generating flashcards:', error)

    // OpenAI-specific errors
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Service is busy. Please try again in a few moments.' },
        { status: 429 }
      )
    }

    if (error.status === 401 || error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'API configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timed out. Please try with a shorter PDF.' },
        { status: 504 }
      )
    }

    // Supabase storage errors
    if (error.message?.includes('storage')) {
      return NextResponse.json(
        { error: 'Failed to save content. Please try again.' },
        { status: 500 }
      )
    }

    // Generic error
    return NextResponse.json(
      { error: error.message || 'Failed to generate flashcards. Please try again.' },
      { status: 500 }
    )
  }
}
```

**Client-Side Error Display:**
```typescript
import { motion, AnimatePresence } from 'framer-motion'

<AnimatePresence>
  {error && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="text-red-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-800">Error</h3>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
        <button
          onClick={() => setError(null)}
          className="text-red-400 hover:text-red-600"
        >
          ✕
        </button>
      </div>

      {retryable && (
        <Button
          onClick={handleRetry}
          variant="outline"
          size="sm"
          className="mt-3"
        >
          Try Again
        </Button>
      )}
    </motion.div>
  )}
</AnimatePresence>
```

### Timeout Handling

**API Routes Configuration:**
```typescript
// All generation routes
export const runtime = 'nodejs'
export const maxDuration = 120 // 2 minutes

// Show warning after 90 seconds
useEffect(() => {
  if (status === 'loading') {
    const warningTimer = setTimeout(() => {
      setWarningMessage('This is taking longer than usual. Please wait...')
    }, 90000)

    return () => clearTimeout(warningTimer)
  }
}, [status])
```

---

## 9. Cost Optimization & Performance

### Cost Estimates (OpenAI Pricing)

**Per PDF (8,000 characters of legal text):**

| Feature | Model | Estimated Cost |
|---------|-------|----------------|
| Quiz (10 questions) | GPT-4 Turbo | ~$0.03 |
| Flashcards (30 cards) | GPT-4 Turbo | ~$0.04 |
| Podcast Script | GPT-4 Turbo | ~$0.03 |
| Podcast Audio (8 min) | TTS-1 | ~$0.12 |
| Slides (15 slides) | GPT-4 Turbo | ~$0.03 |
| **Total (all features)** | | **~$0.25** |

### Optimization Strategies

**1. Reuse PDF Text Extraction**
```typescript
// Extract PDF text once, store in component state
const [pdfData, setPdfData] = useState<{
  text: string
  filename: string
  metadata: { pages: number, characters: number }
} | null>(null)

// Pass to all generation functions
// Avoid re-parsing PDF multiple times
```

**2. Smart Model Selection**
```typescript
// Use cheaper model for basic difficulty
const getModel = (difficulty: string) => {
  return difficulty === 'basic'
    ? 'gpt-3.5-turbo'        // ~10x cheaper
    : 'gpt-4-turbo-preview'  // Better quality
}

// Basic flashcards/slides work well with 3.5-turbo
// Advanced content benefits from GPT-4
```

**3. Efficient TTS Usage**
```typescript
// Use standard TTS (tts-1) instead of HD
// 50% cheaper, quality still good for educational content
const audioFile = await openai.audio.speech.create({
  model: "tts-1",  // Not "tts-1-hd"
  voice: "nova",
  input: podcastScript
})
```

**4. Content Caching Strategy**
```typescript
// Before generating, check for existing content
const checkExistingContent = async (
  userId: string,
  pdfFilename: string,
  contentType: string,
  difficulty: string
) => {
  const { data } = await supabase
    .from('generated_content')
    .select('*')
    .eq('user_id', userId)
    .eq('pdf_filename', pdfFilename)
    .eq('content_type', contentType)
    .eq('content_data->>difficulty', difficulty)
    .single()

  return data
}

// If exists and recent (< 7 days), offer to reuse
if (existingContent) {
  const askReuse = confirm('You already generated flashcards for this PDF. Reuse existing?')
  if (askReuse) return existingContent
}
```

**5. PDF Chunking (Large Documents)**
```typescript
// Reuse existing chunking logic from process-pdf
import { chunkText, selectRepresentativeChunks } from '@/lib/pdfChunker'

const chunkResult = chunkText(pdfText, {
  maxChunkSize: 8000,
  overlapSize: 500,
  minChunkSize: 1000
})

// For flashcards: distribute across chunks
// Generate 10 cards from chunk 1, 10 from chunk 2, etc.
// Better coverage of large PDFs
```

**6. Rate Limiting**
```typescript
// Prevent abuse and manage costs
// Store in Supabase or Redis

const checkRateLimit = async (userId: string) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  const { count } = await supabase
    .from('generated_content')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo.toISOString())

  if (count && count >= 10) {
    throw new Error('Rate limit exceeded. Please try again in an hour.')
  }
}
```

**7. Parallel Generation (Optional Batch Mode)**
```typescript
// Generate multiple features simultaneously
const generateAll = async () => {
  const [quiz, flashcards, slides] = await Promise.all([
    generateQuiz(pdfText, config),
    generateFlashcards(pdfText, config),
    generateSlides(pdfText, config)
  ])

  // Podcast separate (takes longer with TTS)
  const podcast = await generatePodcast(pdfText, config)

  return { quiz, flashcards, slides, podcast }
}
```

### Performance Optimizations

**1. Lazy Loading**
```typescript
// Load ContentLibrary data only when needed
const ContentLibrary = dynamic(() => import('@/components/ContentLibrary'), {
  loading: () => <Spinner />,
  ssr: false
})
```

**2. Optimistic UI Updates**
```typescript
// Show content immediately, save in background
const handleGenerateFlashcards = async () => {
  // Optimistically show loading state
  setFlashcards(null)
  setStatus('loading')

  const data = await generateFlashcards()

  // Show content immediately
  setFlashcards(data.flashcards)
  setStatus('success')

  // Save to Supabase in background (don't await)
  saveToSupabase(data).catch(console.error)
}
```

**3. Audio Streaming (Future Enhancement)**
```typescript
// Stream audio as it generates instead of waiting for full file
// Requires chunked audio generation
// Better UX for long podcasts
```

**4. Pagination & Infinite Scroll**
```typescript
// ContentLibrary with pagination
const [page, setPage] = useState(1)
const ITEMS_PER_PAGE = 10

const { data, isLoading } = useQuery({
  queryKey: ['content', page],
  queryFn: () => fetchContent(page, ITEMS_PER_PAGE)
})
```

---

## 10. Implementation Phases & Testing

### Implementation Roadmap

**Phase 1: Authentication Foundation** (Week 1)
- [ ] Set up Supabase Auth in dashboard
- [ ] Install auth helpers: `@supabase/auth-helpers-nextjs`
- [ ] Create `AuthProvider` context component
- [ ] Build `LoginForm` and `SignupForm` components
- [ ] Create `/login` and `/signup` pages
- [ ] Implement middleware for protected routes
- [ ] Update `Header` component with auth UI
- [ ] Test login/signup/logout flows

**Phase 2: Database & Storage Setup** (Week 1)
- [ ] Create `generated_content` table in Supabase
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create storage buckets: `podcast-audio`, `presentation-slides`
- [ ] Configure storage RLS policies
- [ ] Test CRUD operations with authenticated users
- [ ] Verify file upload/download permissions

**Phase 3: Flashcards Feature** (Week 2)
- [ ] Install dependencies: None needed (using OpenAI)
- [ ] Create `/api/generate-flashcards/route.ts`
- [ ] Write flashcard generation prompt
- [ ] Implement OpenAI integration
- [ ] Create `types/flashcard.ts` with interfaces
- [ ] Build `FlashcardViewer` component with flip animation
- [ ] Add download functionality (JSON/CSV)
- [ ] Integrate with PDFUpload component (add button)
- [ ] Test with various PDFs and difficulty levels
- [ ] Handle errors and edge cases

**Phase 4: Slides Feature** (Week 2-3)
- [ ] Install `jspdf`: `npm install jspdf`
- [ ] Create `/api/generate-slides/route.ts`
- [ ] Write slides generation prompt
- [ ] Implement PDF generation with jsPDF
- [ ] Integrate Supabase storage upload
- [ ] Create `SlidesViewer` component
- [ ] Use `react-pdf` for preview: `npm install react-pdf`
- [ ] Add download functionality
- [ ] Integrate with PDFUpload component
- [ ] Test slide generation and viewing

**Phase 5: Podcast Feature** (Week 3-4)
- [ ] Create `/api/generate-podcast/route.ts`
- [ ] Write podcast script generation prompt
- [ ] Integrate OpenAI TTS API
- [ ] Handle audio file buffer → upload to Supabase Storage
- [ ] Create `PodcastPlayer` component
- [ ] Implement audio player controls
- [ ] Add script display with scrolling
- [ ] Add download functionality (audio + script)
- [ ] Integrate with PDFUpload component
- [ ] Test audio generation and playback
- [ ] Optimize for different podcast lengths

**Phase 6: Content Library** (Week 4)
- [ ] Create `/library/page.tsx` route
- [ ] Build `ContentLibrary` component
- [ ] Implement filtering/sorting
- [ ] Add search functionality
- [ ] Display all content types in unified view
- [ ] Add delete functionality
- [ ] Implement pagination
- [ ] Add empty states
- [ ] Test with multiple content items

**Phase 7: UI Integration & Polish** (Week 5)
- [ ] Update `PDFUpload` component UI (4 buttons)
- [ ] Add configuration options (difficulty, counts)
- [ ] Implement loading states for all features
- [ ] Add error handling UI components
- [ ] Polish animations with framer-motion
- [ ] Add toast notifications
- [ ] Ensure responsive design (mobile/tablet)
- [ ] Add keyboard shortcuts (flashcard navigation)
- [ ] Accessibility audit (ARIA labels, focus management)

**Phase 8: Optimization & Testing** (Week 5-6)
- [ ] Implement caching strategy
- [ ] Add rate limiting
- [ ] Optimize API calls (model selection based on difficulty)
- [ ] Performance testing (large PDFs)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing
- [ ] Load testing (concurrent users)
- [ ] Security audit (RLS policies, auth flows)
- [ ] Bug fixes and refinements

### Testing Strategy

**Unit Tests** (Jest + React Testing Library)
```typescript
// Example: Flashcard generation prompt builder
describe('buildFlashcardPrompt', () => {
  it('includes correct card count', () => {
    const prompt = buildFlashcardPrompt({ cardCount: 30, difficulty: 'basic' })
    expect(prompt).toContain('exactly 30 flashcards')
  })

  it('includes difficulty level', () => {
    const prompt = buildFlashcardPrompt({ cardCount: 15, difficulty: 'advanced' })
    expect(prompt).toContain('Difficulty Level: advanced')
  })
})

// Example: Download helper
describe('downloadFlashcards', () => {
  it('generates valid JSON', () => {
    const flashcards = [
      { front: 'Q1', back: 'A1', type: 'question', difficulty: 'basic' }
    ]
    const json = generateFlashcardJSON(flashcards)
    expect(() => JSON.parse(json)).not.toThrow()
  })
})
```

**Integration Tests** (Playwright)
```typescript
// Example: Full flashcard generation flow
test('user can generate and download flashcards', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')

  // Upload PDF
  await page.goto('/')
  await page.setInputFiles('input[type="file"]', 'test-pdfs/constitutional-law.pdf')

  // Generate flashcards
  await page.click('button:has-text("Generate Flashcards")')
  await page.waitForSelector('text=30 flashcards generated', { timeout: 60000 })

  // Download
  const downloadPromise = page.waitForEvent('download')
  await page.click('button:has-text("Download as JSON")')
  const download = await downloadPromise
  expect(download.suggestedFilename()).toContain('flashcards.json')
})
```

**Manual Testing Checklist**

Authentication:
- [ ] Sign up with new account
- [ ] Verify email confirmation flow
- [ ] Log in with existing account
- [ ] Invalid credentials show error
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] Session persists after page refresh

Flashcards:
- [ ] Generate 15/30/45 cards
- [ ] Test all difficulty levels
- [ ] Flip animation works smoothly
- [ ] Navigation (prev/next) works
- [ ] Download JSON format
- [ ] Download CSV format (Anki-compatible)
- [ ] Cards display correctly on mobile

Podcast:
- [ ] Script generates correctly
- [ ] Audio plays in browser
- [ ] Playback controls work (play, pause, seek)
- [ ] Speed control works (0.75x - 2x)
- [ ] Download audio (MP3)
- [ ] Download script (TXT)
- [ ] Audio quality is acceptable

Slides:
- [ ] Generates appropriate slide count
- [ ] PDF preview displays correctly
- [ ] Navigation between slides works
- [ ] Download PDF works
- [ ] Slides are readable and well-formatted
- [ ] Fullscreen mode works

Content Library:
- [ ] Shows all generated content
- [ ] Filter by type works
- [ ] Sort by date works
- [ ] Search functionality works
- [ ] Delete content works
- [ ] Pagination works
- [ ] Empty state displays when no content

**Test PDFs**

Prepare varied test cases:
1. **Short case** (2-3 pages, 1,500 chars) - Basic tort law case
2. **Medium chapter** (10-15 pages, 8,000 chars) - Constitutional law chapter
3. **Long document** (30+ pages, 20,000+ chars) - Full legal textbook chapter
4. **Scanned PDF** (no selectable text) - Should fail gracefully with clear error
5. **Complex formatting** (tables, footnotes) - Test parsing robustness
6. **Nigerian legal content** - Supreme Court judgment to test context accuracy

**Error Scenarios to Test**
- [ ] Uploaded PDF has no text
- [ ] OpenAI API rate limit exceeded
- [ ] Network timeout during generation
- [ ] Supabase storage quota exceeded
- [ ] Invalid session (expired token)
- [ ] Browser offline during generation
- [ ] Corrupted PDF file
- [ ] Very large PDF (>50 pages)

### Monitoring & Analytics

**Track Key Metrics:**
- Generation success/failure rates
- Average generation time per feature
- User engagement (which features used most)
- Cost per user per month (OpenAI spend)
- Error rates by type
- Storage usage per user

**Logging Strategy:**
```typescript
// Server-side logging
console.log('[Flashcards] Starting generation', {
  userId,
  pdfFilename,
  difficulty,
  cardCount,
  timestamp: new Date().toISOString()
})

// Log errors with context
console.error('[Podcast] Generation failed', {
  userId,
  error: error.message,
  stack: error.stack,
  pdfFilename
})
```

---

## Summary

This design adds three powerful study features to the Law School Study Buddy using OpenAI exclusively:

1. **Flashcards**: AI-generated cards (15/30/45) with mixed formats (Q&A, terms, cases)
2. **Podcast**: Script + audio narration (5-10 min) using OpenAI TTS
3. **Slides**: AI-generated PDF presentations (10-25 slides)

**Key Technical Decisions:**
- ✅ OpenAI GPT-4 Turbo for all content generation
- ✅ OpenAI TTS (tts-1, voice: nova) for audio
- ✅ Supabase Auth for user authentication
- ✅ Supabase Storage for audio/PDF files
- ✅ Supabase Database for content metadata
- ✅ LocalStorage for temporary caching
- ✅ Downloadable formats (JSON, CSV, MP3, PDF)
- ✅ Difficulty levels apply to all features
- ✅ Configurable counts (flashcards: 15/30/45)
- ✅ AI-determined slide count based on content

**Estimated Timeline:** 5-6 weeks for full implementation and testing

**Estimated Cost:** ~$0.25 per PDF if all features used (optimizable to ~$0.15 with caching and smart model selection)

---

**Next Steps:**
1. Review and approve this design
2. Set up Supabase Auth and database tables
3. Begin Phase 1 implementation (Authentication)
4. Iterative development through phases 2-8

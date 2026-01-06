# Implementation Prompts - Flashcards, Podcast & Slides Features

This file contains ready-to-use prompts for implementing the features designed in `2026-01-05-flashcards-podcast-slides-design.md`.

---

## 🚀 Main Implementation Prompt (All Phases)

Copy and paste this to implement everything at once:

```
I need help implementing the design specified in @docs/plans/2026-01-05-flashcards-podcast-slides-design.md

Context:
- Next.js 14 Law School Study Buddy app (Nigerian law focus)
- Currently has PDF upload → quiz generation with OpenAI GPT-4 Turbo
- Uses Supabase for database (scores table exists)
- Uses Tailwind CSS with custom Nigerian-themed colors
- Tech stack: Next.js 14, React, TypeScript, OpenAI, Supabase

The design adds 3 new features:
1. Flashcard generation (15/30/45 cards, mixed Q&A/term/case formats)
2. Podcast summaries (script + audio via OpenAI TTS)
3. Slide presentations (PDF format, AI-determined slide count)

Plus Supabase Auth for user authentication.

Follow the 8-phase implementation plan:
✅ Phase 1: Authentication (Supabase Auth)
✅ Phase 2: Database & Storage setup
✅ Phase 3: Flashcards feature
✅ Phase 4: Slides feature
✅ Phase 5: Podcast feature
✅ Phase 6: Content Library
✅ Phase 7: UI Integration
✅ Phase 8: Optimization & Testing

Key requirements:
- Use OpenAI for everything (GPT-4 Turbo + TTS)
- Implement Supabase Auth with login/signup/logout
- Store content in Supabase with RLS policies
- Add download functionality (JSON, CSV, MP3, PDF)
- Handle errors gracefully
- Follow existing code patterns

Please read the design doc and implement all phases. Let me know when each phase is complete so I can test.
```

---

## 📋 Phase-by-Phase Prompts

Use these if you want to implement one phase at a time:

### Phase 1: Authentication

```
Please implement Phase 1 (Authentication) from @docs/plans/2026-01-05-flashcards-podcast-slides-design.md

Tasks:
1. Set up Supabase Auth configuration
2. Install @supabase/auth-helpers-nextjs
3. Create AuthProvider context component
4. Build LoginForm and SignupForm components
5. Create /login and /signup pages
6. Implement middleware for protected routes
7. Update Header component with user info and logout button

When done, let me know so I can test the auth flow.
```

### Phase 2: Database & Storage

```
Please implement Phase 2 (Database & Storage) from @docs/plans/2026-01-05-flashcards-podcast-slides-design.md

Tasks:
1. Create generated_content table in Supabase
2. Set up Row Level Security (RLS) policies
3. Create storage buckets: podcast-audio, presentation-slides
4. Configure storage RLS policies
5. Test CRUD operations

Provide the SQL scripts I need to run in Supabase SQL editor.
```

### Phase 3: Flashcards

```
Please implement Phase 3 (Flashcards) from @docs/plans/2026-01-05-flashcards-podcast-slides-design.md

Tasks:
1. Create /api/generate-flashcards/route.ts
2. Implement OpenAI integration with flashcard prompt
3. Create types/flashcard.ts
4. Build FlashcardViewer component with flip animation
5. Add download functionality (JSON/CSV)
6. Add "Generate Flashcards" button to PDFUpload

Test with a sample PDF when done.
```

### Phase 4: Slides

```
Please implement Phase 4 (Slides) from @docs/plans/2026-01-05-flashcards-podcast-slides-design.md

Tasks:
1. Install jspdf: npm install jspdf
2. Create /api/generate-slides/route.ts
3. Implement PDF generation with jsPDF
4. Integrate Supabase storage upload
5. Install react-pdf: npm install react-pdf
6. Build SlidesViewer component
7. Add download functionality
8. Add "Generate Slides" button to PDFUpload

Test PDF generation and viewing.
```

### Phase 5: Podcast

```
Please implement Phase 5 (Podcast) from @docs/plans/2026-01-05-flashcards-podcast-slides-design.md

Tasks:
1. Create /api/generate-podcast/route.ts
2. Implement script generation with GPT-4 Turbo
3. Integrate OpenAI TTS API (model: tts-1, voice: nova)
4. Handle audio upload to Supabase Storage
5. Build PodcastPlayer component with controls
6. Add script display with scrolling
7. Add download functionality (MP3 + TXT)
8. Add "Generate Podcast" button to PDFUpload

This is the most complex phase - test audio generation carefully.
```

### Phase 6: Content Library

```
Please implement Phase 6 (Content Library) from @docs/plans/2026-01-05-flashcards-podcast-slides-design.md

Tasks:
1. Create /library/page.tsx route
2. Build ContentLibrary component
3. Implement filtering by type
4. Add sorting by date
5. Add search functionality
6. Display all content types
7. Add delete functionality
8. Implement pagination
9. Add empty states

Test with multiple generated content items.
```

### Phase 7: UI Integration

```
Please implement Phase 7 (UI Integration) from @docs/plans/2026-01-05-flashcards-podcast-slides-design.md

Tasks:
1. Update PDFUpload component to show 4 generation buttons
2. Add configuration options (difficulty, card count)
3. Implement loading states for all features
4. Add error handling UI
5. Polish animations with framer-motion
6. Ensure responsive design (mobile/tablet)
7. Add keyboard shortcuts for flashcard navigation
8. Accessibility improvements

Review the entire user flow end-to-end.
```

### Phase 8: Optimization & Testing

```
Please implement Phase 8 (Optimization & Testing) from @docs/plans/2026-01-05-flashcards-podcast-slides-design.md

Tasks:
1. Implement content caching strategy
2. Add rate limiting (10 generations per hour per user)
3. Optimize API calls (use gpt-3.5-turbo for basic difficulty)
4. Add error retry logic
5. Performance testing with large PDFs
6. Cross-browser testing checklist
7. Mobile responsiveness verification
8. Security audit of RLS policies

Provide a testing checklist when done.
```

---

## 🔍 Verification Prompts

Use these after implementing phases to verify everything works:

### Test Authentication

```
Please help me test the authentication system:

1. Walk me through testing signup flow
2. Test login with valid/invalid credentials
3. Verify protected routes redirect to /login
4. Test logout clears session
5. Verify session persists after page refresh

What should I check in the Supabase dashboard?
```

### Test Database & Storage

```
Please verify the database and storage setup:

1. Check generated_content table exists with correct schema
2. Verify RLS policies are working (users can only see their own content)
3. Confirm storage buckets exist: podcast-audio, presentation-slides
4. Test file upload permissions
5. Generate a SQL query to view my generated content

What queries should I run to verify everything?
```

### Test Feature Integration

```
Please help me test all features end-to-end:

1. Upload a test PDF
2. Generate flashcards (test 15, 30, 45 counts)
3. Generate podcast (verify audio plays)
4. Generate slides (verify PDF displays)
5. Test downloads for each format
6. Check Content Library shows all items
7. Test delete functionality

Provide a comprehensive testing checklist.
```

---

## 🐛 Debugging Prompts

Use these if you encounter issues:

### OpenAI API Issues

```
I'm getting errors when calling OpenAI API:

[paste error message here]

Context:
- Feature: [flashcards/podcast/slides]
- Difficulty: [basic/intermediate/advanced]
- PDF size: [characters/pages]

Please help debug and suggest a fix.
```

### Supabase Storage Issues

```
I'm having trouble with Supabase Storage:

[paste error message here]

Context:
- Bucket: [podcast-audio or presentation-slides]
- Operation: [upload/download/delete]
- File size: [MB]

Please help debug the storage configuration.
```

### Authentication Issues

```
Authentication is not working correctly:

Problem: [describe issue]
Error: [paste error if any]

Context:
- Route: [/login, /signup, protected route]
- Expected behavior: [what should happen]
- Actual behavior: [what actually happens]

Please help fix the auth flow.
```

### Component Rendering Issues

```
A component is not rendering correctly:

Component: [FlashcardViewer/PodcastPlayer/SlidesViewer]
Issue: [describe the problem]
Browser: [Chrome/Firefox/Safari]
Device: [Desktop/Mobile]

Please help debug the component.
```

---

## 🔧 Configuration Prompts

### Environment Variables Setup

```
Please help me set up the environment variables:

I have:
- OPENAI_API_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

1. Verify these are all I need
2. Show me where to find each in Supabase dashboard
3. Explain what each key is used for
4. Create a .env.local.example file
```

### Supabase SQL Scripts

```
Please provide all SQL scripts I need to run in Supabase SQL Editor:

1. Create generated_content table
2. Set up RLS policies for generated_content
3. Create indexes for performance
4. Set up storage bucket policies
5. Any other database setup needed

Provide complete, copy-pasteable SQL.
```

### Dependencies Installation

```
Please provide the complete list of dependencies to install:

npm install [list all packages needed]

Include:
- Auth helpers
- PDF generation
- PDF viewing
- Any other new dependencies

Also update package.json scripts if needed.
```

---

## 📊 Cost Monitoring Prompt

```
Help me understand and monitor OpenAI costs:

1. Show me how to calculate cost per generation
2. Create a cost tracking function
3. Set up alerts for high usage
4. Optimize prompts to reduce token usage
5. Suggest caching strategies

Provide code for cost monitoring.
```

---

## 🎨 UI/UX Improvement Prompts

### Polish Animations

```
Please improve the animations and transitions:

1. Flashcard flip animation (make it smoother)
2. Loading states (add skeleton screens)
3. Page transitions
4. Button hover effects
5. Error message animations

Use framer-motion for consistency.
```

### Responsive Design

```
Please ensure responsive design for:

1. PDFUpload component (mobile view)
2. FlashcardViewer (tablet/mobile)
3. PodcastPlayer (small screens)
4. SlidesViewer (mobile optimization)
5. ContentLibrary (responsive grid)

Test on: iPhone SE, iPad, Desktop.
```

### Accessibility

```
Please audit and improve accessibility:

1. Add ARIA labels to all interactive elements
2. Ensure keyboard navigation works
3. Test with screen readers
4. Add focus indicators
5. Ensure color contrast meets WCAG AA

Provide specific changes needed.
```

---

## 📝 Documentation Prompts

### API Documentation

```
Please create API documentation for the new routes:

1. /api/generate-flashcards
2. /api/generate-podcast
3. /api/generate-slides

Include:
- Request/response formats
- Authentication requirements
- Error codes
- Example requests with curl

Create an API.md file.
```

### User Guide

```
Please create a user guide (USER_GUIDE.md) covering:

1. How to sign up and log in
2. How to upload PDFs
3. How to generate each content type
4. How to download generated content
5. How to manage content library
6. Troubleshooting common issues

Make it beginner-friendly.
```

### Developer Setup Guide

```
Please create a developer setup guide (SETUP.md):

1. Prerequisites (Node.js, Supabase account, OpenAI key)
2. Clone and install dependencies
3. Environment variables setup
4. Supabase configuration (SQL scripts)
5. Running locally (dev server)
6. Running tests
7. Building for production

Step-by-step instructions.
```

---

## 🚢 Deployment Prompts

### Vercel Deployment

```
Please help me deploy to Vercel:

1. What environment variables to set in Vercel dashboard
2. Any build settings to configure
3. Domain setup (if applicable)
4. How to verify deployment works
5. How to check logs for errors

Provide a deployment checklist.
```

### Production Optimization

```
Optimize the app for production:

1. Bundle size optimization
2. Image optimization
3. API route caching headers
4. Database query optimization
5. CDN setup for static assets

Suggest specific improvements.
```

---

## 📞 Support Prompts

### Error Reporting Template

```
I encountered an error:

**Feature:** [Quiz/Flashcards/Podcast/Slides]
**Action:** [What I was trying to do]
**Error Message:**
```
[paste error here]
```

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Browser:** [Chrome/Firefox/Safari]
**Steps to reproduce:**
1.
2.
3.

Please help diagnose and fix.
```

### Feature Request Template

```
Feature request for improvement:

**Feature:** [which existing feature]
**Suggestion:** [what you want to add/change]
**Use case:** [why this would be helpful]
**Priority:** [Low/Medium/High]

How feasible is this? What would implementation involve?
```

---

## 🎯 Quick Reference

**Start fresh implementation:**
→ Use "Main Implementation Prompt"

**Implement step-by-step:**
→ Use "Phase-by-Phase Prompts" in order

**Something not working:**
→ Use "Debugging Prompts"

**Need to verify:**
→ Use "Verification Prompts"

**Deploying:**
→ Use "Deployment Prompts"

---

## Notes

- Always reference the design doc: `@docs/plans/2026-01-05-flashcards-podcast-slides-design.md`
- Test each phase before moving to the next
- Keep environment variables secure (never commit .env.local)
- Monitor OpenAI costs closely in the first week
- Back up Supabase database regularly

Good luck with implementation! 🚀

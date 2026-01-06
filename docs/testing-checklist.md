# Testing Checklist - Flashcards, Podcast & Slides Features

## Pre-Testing Setup
- [ ] Ensure `OPENAI_API_KEY` is set in `.env.local`
- [ ] Ensure Supabase environment variables are set
- [ ] Run `npm run build` to verify no build errors
- [ ] Start dev server with `npm run dev`

---

## 1. Rate Limiting Tests

### Test: Rate Limit Enforcement (10 generations/hour)
- [ ] Log in as test user
- [ ] Generate 10 pieces of content (mix of flashcards, podcasts, slides)
- [ ] On 11th generation attempt, verify 429 error returned
- [ ] Verify error message: "Rate limit exceeded..."
- [ ] Verify `X-RateLimit-Remaining` header decrements correctly
- [ ] Verify `X-RateLimit-Reset` header shows correct reset time

### Test: Rate Limit Reset
- [ ] Wait for rate limit window to reset (or adjust time in database)
- [ ] Verify generation works again after reset

---

## 2. Content Caching Tests

### Test: Cache Hit - Flashcards
- [ ] Upload a PDF and generate flashcards
- [ ] Upload same PDF again with same difficulty
- [ ] Verify cached response returned (check `metadata.cached: true`)
- [ ] Verify response is faster (cached vs fresh generation)

### Test: Cache Miss - Different Difficulty
- [ ] Upload same PDF with different difficulty level
- [ ] Verify new content is generated (not cached)

### Test: Cache Bypass
- [ ] Upload PDF with `skipCache: true` parameter
- [ ] Verify fresh content is generated even if cached version exists

### Test: Cache for Podcasts
- [ ] Generate podcast for a PDF
- [ ] Re-upload same PDF
- [ ] Verify cached podcast script and audio URL returned

### Test: Cache for Slides
- [ ] Generate slides for a PDF
- [ ] Re-upload same PDF
- [ ] Verify cached slides data returned

---

## 3. Model Selection Tests

### Test: Basic Difficulty Uses GPT-3.5-Turbo
- [ ] Generate flashcards with `difficulty: 'basic'`
- [ ] Check server logs for `[Flashcards] Generating with model: gpt-3.5-turbo`
- [ ] Repeat for podcast and slides

### Test: Intermediate/Advanced Uses GPT-4-Turbo
- [ ] Generate content with `difficulty: 'intermediate'`
- [ ] Check logs for `model: gpt-4-turbo-preview`
- [ ] Generate content with `difficulty: 'advanced'`
- [ ] Verify GPT-4-Turbo used

---

## 4. Error Retry Tests

### Test: Transient Error Recovery
- [ ] Simulate rate limit from OpenAI (429 error)
- [ ] Verify retry logic kicks in (check logs for retry attempts)
- [ ] Verify exponential backoff (delays increase)

### Test: Permanent Error Handling
- [ ] Test with invalid API key
- [ ] Verify appropriate error message returned to user
- [ ] Verify no infinite retry loops

---

## 5. Flashcard Feature Tests

### Test: Generation
- [ ] Upload valid PDF
- [ ] Select Basic difficulty, 15 cards
- [ ] Verify 15 flashcards generated
- [ ] Verify each card has front, back, type, difficulty

### Test: Flashcard Types
- [ ] Verify mix of card types: question, term, case
- [ ] Verify appropriate Nigerian legal context

### Test: Keyboard Navigation
- [ ] Press `Space` or `Enter` to flip card
- [ ] Press `←` or `J` for previous card
- [ ] Press `→` or `K` for next card
- [ ] Press `S` to shuffle
- [ ] Press `?` to toggle help
- [ ] Press `Escape` to close help

### Test: Download
- [ ] Click download button
- [ ] Test JSON export - verify valid JSON structure
- [ ] Test CSV export - verify proper CSV format

---

## 6. Podcast Feature Tests

### Test: Script Generation
- [ ] Upload valid PDF
- [ ] Verify script generated (800-1200 words)
- [ ] Verify Nigerian legal context in script

### Test: Audio Generation
- [ ] Verify audio URL returned
- [ ] Verify audio plays correctly
- [ ] Verify audio quality acceptable

### Test: Long Script Chunking (TTS 4096 limit)
- [ ] Upload large PDF generating long script
- [ ] Verify script is split and audio concatenated
- [ ] Verify no audio cuts or gaps

### Test: Keyboard Controls
- [ ] Press `Space` or `K` to play/pause
- [ ] Press `J` to rewind 10s
- [ ] Press `L` to forward 10s
- [ ] Press `←` to rewind 5s
- [ ] Press `→` to forward 5s
- [ ] Press `M` to mute/unmute

---

## 7. Slides Feature Tests

### Test: Generation
- [ ] Upload valid PDF
- [ ] Verify slides generated (10-25 slides based on difficulty)
- [ ] Verify each slide has title, bullets, optional footer

### Test: PDF Export
- [ ] Verify PDF download link works
- [ ] Open downloaded PDF
- [ ] Verify slides render correctly (blue header, bullets, footers)

---

## 8. Authentication Tests

### Test: Protected Routes
- [ ] Try accessing /api/generate-flashcards without auth
- [ ] Verify 401 Unauthorized response
- [ ] Repeat for podcast and slides routes

### Test: Session Persistence
- [ ] Log in, generate content
- [ ] Refresh page
- [ ] Verify session persists, can still generate

---

## 9. Accessibility Tests

### Test: Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Verify focus indicators visible
- [ ] Verify all buttons keyboard accessible

### Test: Screen Reader
- [ ] Test with VoiceOver (Mac) or NVDA (Windows)
- [ ] Verify ARIA labels read correctly
- [ ] Verify flashcard flip announced

### Test: Dark Mode
- [ ] Toggle dark mode
- [ ] Verify all components render correctly
- [ ] Verify contrast ratios acceptable

---

## 10. Performance Tests

### Test: Response Times
- [ ] Measure flashcard generation time (target: <15s)
- [ ] Measure podcast generation time (target: <45s)
- [ ] Measure slides generation time (target: <30s)

### Test: Cached Response Times
- [ ] Measure cached response time (target: <500ms)

---

## 11. Error Handling Tests

### Test: Invalid PDF
- [ ] Upload image file with .pdf extension
- [ ] Verify error: "No text could be extracted..."

### Test: Empty PDF
- [ ] Upload PDF with no text (scanned without OCR)
- [ ] Verify appropriate error message

### Test: Network Error
- [ ] Simulate network disconnect during generation
- [ ] Verify graceful error handling

---

## Sign-off

| Test Category | Passed | Failed | Notes |
|---------------|--------|--------|-------|
| Rate Limiting | | | |
| Caching | | | |
| Model Selection | | | |
| Error Retry | | | |
| Flashcards | | | |
| Podcast | | | |
| Slides | | | |
| Authentication | | | |
| Accessibility | | | |
| Performance | | | |
| Error Handling | | | |

**Tested By:** _______________
**Date:** _______________
**Environment:** Development / Staging / Production

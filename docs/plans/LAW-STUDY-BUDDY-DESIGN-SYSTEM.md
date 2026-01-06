# Law Study Buddy - Design System Reference for Claude Code

**App Purpose:** Help Nigerian law students with revision by generating questions, flashcards, slides, and podcast-style audio summaries from uploaded PDFs.

**Tech Stack:** Next.js, Tailwind CSS, TypeScript

**Design Vibe:** Modern & sleek, friendly & approachable

**Inspiration:** Framer.com, Resend.com (clean, minimal, professional)

---

## 🎨 COLOR PALETTE

### Primary - Emerald (Brand Color)
Use for actions, links, success states, brand elements

```tsx
bg-primary-50   #ECFDF5  // Subtle backgrounds, success highlights
bg-primary-100  #D1FAE5  // Hover backgrounds, light badges
bg-primary-500  #10B981  // MAIN BRAND COLOR - buttons, links
bg-primary-600  #059669  // Hover states
bg-primary-700  #047857  // Active states
bg-primary-800  #065F46  // Text on light backgrounds
```

### Neutrals - Slate (Text, Backgrounds, Borders)
```tsx
bg-slate-50     #F8FAFC  // Page background
bg-slate-100    #F1F5F9  // Card backgrounds, disabled states
bg-slate-200    #E2E8F0  // Borders, dividers
bg-slate-300    #CBD5E1  // Disabled text, inactive states
bg-slate-400    #94A3B8  // Placeholder text
bg-slate-500    #64748B  // Secondary text
bg-slate-600    #475569  // Body text
bg-slate-700    #334155  // Primary body text (MOST USED)
bg-slate-800    #1E293B  // Headings
bg-slate-900    #0F172A  // High emphasis headings
```

### Semantic Colors
```tsx
// Success
bg-emerald-500  #10B981  text-emerald-800  // Success states

// Error
bg-red-500      #EF4444  text-red-800      // Errors, urgent

// Warning
bg-amber-500    #F59E0B  text-amber-800    // Warnings, highlights

// Info
bg-blue-500     #3B82F6  text-blue-800     // Information

// Podcast/Premium
bg-purple-500   #A855F7  text-purple-800   // Audio features, premium
```

### Color Usage Rules
- **Buttons:** `bg-primary-500 text-white` with `hover:bg-primary-600`
- **Body Text:** `text-slate-700` (16px)
- **Headings:** `text-slate-900` or `text-slate-800`
- **Borders:** `border-slate-200` (default), `border-slate-300` (inputs)
- **Page Background:** `bg-slate-50`
- **Cards:** `bg-white`

---

## 📝 TYPOGRAPHY

### Font Family
```tsx
font-sans  // Inter font (already in Next.js)
font-mono  // JetBrains Mono for code
```

### Font Sizes & Usage
```tsx
text-xs     12px   // Captions, tiny labels
text-sm     14px   // Small text, metadata, badges
text-base   16px   // DEFAULT BODY TEXT - use this most
text-lg     18px   // Lead paragraphs, emphasis
text-xl     20px   // H4, small headings
text-2xl    24px   // H3, subsection headings
text-3xl    30px   // H2, section headings
text-4xl    36px   // H1, page titles
text-5xl    48px   // Display text (landing pages)
```

### Font Weights
```tsx
font-normal    400  // Body text (default)
font-medium    500  // UI labels, emphasis
font-semibold  600  // Headings, buttons
font-bold      700  // Strong emphasis
```

### Line Heights
```tsx
leading-tight    1.25   // Large headings
leading-snug     1.375  // Headings
leading-normal   1.5    // Body text (DEFAULT)
leading-relaxed  1.625  // Long-form content
```

### Typography Patterns
```tsx
// H1 - Page Title
className="text-4xl font-semibold text-slate-900"

// H2 - Section
className="text-3xl font-semibold text-slate-800"

// H3 - Subsection
className="text-2xl font-semibold text-slate-800"

// Body (Default)
className="text-base text-slate-700 leading-normal"

// Lead Paragraph
className="text-lg text-slate-600 leading-relaxed"

// Small/Meta Text
className="text-sm text-slate-600"
```

---

## 📏 SPACING SYSTEM

Based on 4px increments. Use these consistently:

```tsx
// Most Common Spacing
gap-4       16px   // Default gap between elements
gap-6       24px   // Comfortable gap
gap-8       32px   // Section gaps

p-4         16px   // Compact padding
p-6         24px   // DEFAULT CARD PADDING
p-8         32px   // Large padding
p-10        40px   // Extra large (flashcards)

space-y-4   16px   // Vertical spacing between elements
space-y-6   24px   // Vertical spacing sections

mb-2        8px    // Small margin bottom
mb-4        16px   // Default margin bottom
mb-6        24px   // Section margin bottom
```

### Container & Layout
```tsx
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  // Page container
max-w-prose                              // Text content (65ch)

// Grid patterns
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

---

## 🎭 EFFECTS

### Shadows
```tsx
shadow-sm   // Cards (default)
shadow-md   // Card hover, dropdowns
shadow-lg   // Flashcards, elevated elements
shadow-xl   // Modals, dialogs
```

### Border Radius
```tsx
rounded-lg     8px    // DEFAULT - buttons, inputs
rounded-xl     12px   // Cards
rounded-2xl    16px   // Feature cards, flashcards
rounded-full   9999px // Pills, avatars, circular buttons
```

### Borders
```tsx
border border-slate-200    // Default border
border-2 border-slate-200  // Thicker border (question cards)
border border-primary-500  // Focus/active border
```

### Transitions
```tsx
transition-colors duration-200  // Standard (use this most)
transition-all duration-300     // Smooth all properties
hover:scale-105                 // Subtle hover scale
```

---

## 🎯 COMPONENT PATTERNS

### Buttons

**Primary Button** (main actions)
```tsx
<button className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 active:bg-primary-700 disabled:bg-slate-300 transition-colors duration-200">
  Generate Questions
</button>
```

**Secondary Button**
```tsx
<button className="px-6 py-3 border border-primary-500 text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-colors duration-200">
  Cancel
</button>
```

**Ghost Button**
```tsx
<button className="px-6 py-3 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-200">
  Skip
</button>
```

### Cards

**Basic Card**
```tsx
<div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
  <h3 className="text-xl font-semibold text-slate-800 mb-2">Title</h3>
  <p className="text-base text-slate-700">Content</p>
</div>
```

**Interactive Card** (clickable)
```tsx
<button className="w-full bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md hover:-translate-y-1 transition-all duration-200">
  {/* Card content */}
</button>
```

**Flashcard**
```tsx
<div className="bg-white rounded-2xl shadow-lg p-10 aspect-[4/3] flex items-center justify-center">
  <p className="text-2xl font-semibold text-slate-900 text-center">
    Question text here
  </p>
</div>

{/* Back side with emerald background */}
<div className="bg-primary-50 rounded-2xl shadow-lg p-10">
  <p className="text-lg text-slate-800">Answer here</p>
</div>
```

**Question Card**
```tsx
<div className="bg-white rounded-xl border-2 border-slate-200 p-8">
  <h3 className="text-lg font-semibold text-slate-900 mb-6">
    Question text here
  </h3>
  
  {/* Options */}
  <div className="space-y-3">
    <label className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 has-[:checked]:bg-primary-50 has-[:checked]:border-primary-500 transition-colors">
      <input type="radio" name="q1" className="w-5 h-5 text-primary-500" />
      <span className="text-base text-slate-700">Option A</span>
    </label>
  </div>
</div>
```

**Audio Player** (podcast style)
```tsx
<div className="bg-gradient-to-b from-purple-50 to-white rounded-2xl shadow-md p-6">
  {/* Title */}
  <div className="flex items-center gap-4 mb-6">
    <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
      {/* Icon */}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-slate-900">Title</h3>
      <p className="text-sm text-slate-600">Duration</p>
    </div>
  </div>
  
  {/* Progress bar */}
  <div className="w-full h-2 bg-slate-200 rounded-full mb-4">
    <div className="h-full bg-purple-500 rounded-full w-1/3"></div>
  </div>
  
  {/* Controls */}
  <div className="flex items-center justify-center gap-4">
    <button className="w-14 h-14 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center transition-colors">
      {/* Play icon */}
    </button>
  </div>
</div>
```

### Inputs

**Text Input**
```tsx
<div className="w-full">
  <label className="block text-sm font-medium text-slate-700 mb-2">
    Label
  </label>
  <input
    type="text"
    placeholder="Placeholder text"
    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
  />
</div>
```

**Textarea**
```tsx
<textarea
  rows={4}
  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 placeholder:text-slate-400 resize-y focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
/>
```

**File Upload**
```tsx
<label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all">
  <input type="file" accept=".pdf" className="hidden" />
  <div className="text-center">
    <div className="w-12 h-12 mx-auto mb-3 text-slate-400">
      {/* Upload icon */}
    </div>
    <span className="text-base font-medium text-slate-700">
      Click to upload or drag and drop
    </span>
    <span className="text-sm text-slate-500 mt-1 block">
      PDF files only (Max 10MB)
    </span>
  </div>
</label>
```

### Badges

```tsx
{/* Success */}
<span className="px-2.5 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
  Completed
</span>

{/* Warning */}
<span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
  In Progress
</span>

{/* Error */}
<span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
  Failed
</span>

{/* Count badge */}
<span className="inline-flex items-center justify-center w-6 h-6 bg-primary-500 text-white text-xs font-semibold rounded-full">
  12
</span>
```

### Alerts

```tsx
{/* Success alert */}
<div className="flex gap-3 p-4 bg-primary-50 border border-primary-200 rounded-lg">
  <svg className="w-5 h-5 text-primary-600 flex-shrink-0" />
  <div>
    <h4 className="text-sm font-semibold text-primary-900 mb-1">Success!</h4>
    <p className="text-sm text-primary-800">Your action completed.</p>
  </div>
</div>

{/* Error alert */}
<div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
  <svg className="w-5 h-5 text-red-600 flex-shrink-0" />
  <div>
    <h4 className="text-sm font-semibold text-red-900 mb-1">Error</h4>
    <p className="text-sm text-red-800">Something went wrong.</p>
  </div>
</div>

{/* Warning alert */}
<div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
  <svg className="w-5 h-5 text-amber-600 flex-shrink-0" />
  <div>
    <h4 className="text-sm font-semibold text-amber-900 mb-1">Warning</h4>
    <p className="text-sm text-amber-800">Please review this.</p>
  </div>
</div>
```

### Loading States

**Spinner**
```tsx
<div className="w-6 h-6 border-2 border-slate-300 border-t-primary-500 rounded-full animate-spin"></div>
```

**Skeleton Loader**
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
  <div className="h-4 bg-slate-200 rounded w-full"></div>
  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
</div>
```

### Empty States

```tsx
<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
    {/* Icon */}
  </div>
  <h3 className="text-lg font-semibold text-slate-900 mb-2">
    No content yet
  </h3>
  <p className="text-sm text-slate-600 mb-6 max-w-sm">
    Get started by uploading your first PDF.
  </p>
  <button className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors">
    Upload PDF
  </button>
</div>
```

### Modal

```tsx
{/* Overlay */}
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"></div>

{/* Modal */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-slate-200">
      <h2 className="text-xl font-semibold text-slate-900">Modal Title</h2>
      <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
        {/* Close icon */}
      </button>
    </div>
    
    {/* Body */}
    <div className="p-6">
      <p className="text-base text-slate-700">Modal content</p>
    </div>
    
    {/* Footer */}
    <div className="flex gap-3 p-6 border-t border-slate-200">
      <button className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50">
        Cancel
      </button>
      <button className="flex-1 px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600">
        Confirm
      </button>
    </div>
  </div>
</div>
```

---

## 📱 RESPONSIVE PATTERNS

```tsx
// Stack on mobile, grid on desktop
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

// Hide on mobile, show on desktop
hidden lg:block

// Full width on mobile, fixed width on desktop
w-full lg:w-64

// Page container
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8

// Responsive text
text-2xl md:text-3xl lg:text-4xl

// Responsive padding
p-4 md:p-6 lg:p-8
```

---

## ♿ ACCESSIBILITY

### Focus States (Required for all interactive elements)
```tsx
focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
```

### Touch Targets
- Minimum 44px × 44px on mobile
- Use `min-w-[44px] min-h-[44px]` for icon buttons

### ARIA Labels (Required for icon-only buttons)
```tsx
<button aria-label="Close dialog">
  <XIcon />
</button>
```

### Screen Reader Text
```tsx
<span className="sr-only">Screen reader only text</span>
```

---

## 🎨 LAYOUT PATTERNS

### Page Structure
```tsx
<div className="min-h-screen bg-slate-50">
  {/* Header */}
  <header className="bg-white border-b border-slate-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Nav content */}
    </div>
  </header>

  {/* Main */}
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Page content */}
  </main>
</div>
```

### Dashboard Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

### Form Layout
```tsx
<form className="space-y-6 max-w-2xl">
  {/* Form fields with space-y-6 */}
</form>
```

---

## 🚀 DESIGN PRINCIPLES FOR CLAUDE CODE

1. **Always use design tokens** - Use the classes above, never hardcode colors/spacing
2. **Mobile-first** - Start with mobile layout, add responsive classes
3. **Consistent spacing** - Use gap-4 (16px), gap-6 (24px), gap-8 (32px)
4. **Clear hierarchy** - Use proper heading levels and sizes
5. **Accessible** - Include focus states, ARIA labels, keyboard navigation
6. **Fast interactions** - Use `transition-colors duration-200` for smooth UX
7. **White space** - Don't crowd elements, use generous padding/margins
8. **Readable text** - Body text is `text-base text-slate-700`, max-width for long content

---

## 📋 QUICK REFERENCE

**Most used combinations:**
```tsx
// Primary button
bg-primary-500 text-white hover:bg-primary-600

// Card
bg-white rounded-xl shadow-sm p-6

// Body text
text-base text-slate-700

// Heading
text-2xl font-semibold text-slate-800

// Input
px-4 py-3 border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200

// Badge
px-2.5 py-1 bg-primary-100 text-primary-800 text-xs rounded-full
```

**Icons:** Use Lucide React (already popular in Next.js ecosystem)

**Content width:** Use `max-w-prose` (65ch) for readable text blocks

---

## ✅ COMPONENT CHECKLIST

When creating components, ensure:
- [ ] Uses design system colors (primary-500, slate-700, etc.)
- [ ] Proper spacing (gap-4, gap-6, p-6, etc.)
- [ ] Responsive (mobile-first with md:, lg: breakpoints)
- [ ] Interactive elements have hover states
- [ ] Focusable elements have focus states
- [ ] Icon-only buttons have aria-label
- [ ] Smooth transitions (200-300ms)
- [ ] Follows patterns above

---

**Remember:** This design system is optimized for Nigerian law students studying dense legal materials. Prioritize clarity, readability, and a friendly learning environment!

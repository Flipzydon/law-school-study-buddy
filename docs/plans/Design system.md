LAW STUDY BUDDY: "THE OBJECTION" DESIGN SYSTEM
Version: 2.0 (The "Ultra" Update) Vibe: Neo-Brutalist, High-Voltage, Tactical, Gen-Z Academic Tech Stack: Next.js, Tailwind CSS, Framer Motion (Recommended)

🎨 COLOR PALETTE: "High Contrast Justice"
We are ditching the safe emeralds. We are using Electric Indigo and Acid Lime to create an interface that feels alive. The background is not "gray," it is "Paper" or "Void."

The Core Spectrum
TypeScript

// ADD TO TAILWIND CONFIG (tailwind.config.js)

colors: {
  // THE BRAND CORE
  primary: {
    DEFAULT: '#5D3FD3', // "Electric Iris" - The main action color
    hover:   '#4B32C3', // Slightly deeper
    content: '#FFFFFF', // Text on primary
  },
  
  // THE ENERGY (Accents)
  accent: {
    DEFAULT: '#CCFF00', // "Volt" - Acid Green for success/highlights/badges
    hover:   '#B3E600',
    content: '#000000', // Text on accent (Always black for contrast)
  },

  // THE ALERTS
  danger: {
    DEFAULT: '#FF3366', // "Radical Red" - Error/Delete
    content: '#FFFFFF',
  },
  
  // THE CANVAS (Light Mode)
  paper: {
    DEFAULT: '#FDFBF7', // "Warm Alabaster" - Easier on eyes than pure white
    dark:    '#F2EFE9', // Secondary backgrounds
    border:  '#1A1A1A', // Borders are ALWAYS dark and sharp
  },

  // THE VOID (Dark Mode / Text)
  ink: {
    DEFAULT: '#1A1A1A', // "Off-Black" - Main text/headings
    light:   '#404040', // Secondary text
    lighter: '#808080', // Placeholders
  }
}
Usage Rules
Borders are Black: In Light mode, borders are #1A1A1A. No subtle grays. We use border-2 as the default.

Shadows are Hard: No blur. box-shadow: 4px 4px 0px 0px #1A1A1A.

Volt Green is for Progress and Wins (e.g., "Flashcard Mastered").

✒️ TYPOGRAPHY: "Bold & Technical"
We are mixing a wide, quirky Grotesque font for headings with a highly legible technical sans for reading complex legal texts.

Google Fonts Imports: @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

Font Families
TypeScript

font-display: ['"Space Grotesk"', 'sans-serif'] // Headings
font-body:    ['"Outfit"', 'sans-serif']        // Reading text
font-mono:    ['"JetBrains Mono"', 'monospace']  // Citations / Case references
Type Scale (Desktop)
TypeScript

text-display-xl:  text-6xl font-bold tracking-tighter leading-none // Landing H1
text-display-lg:  text-5xl font-bold tracking-tight                // Page H1
text-heading-1:   text-3xl font-bold tracking-tight                // Section Headers
text-heading-2:   text-2xl font-semibold                           // Card Titles
text-body-lg:     text-lg  font-medium leading-relaxed             // Intro text
text-body-base:   text-base font-normal leading-normal             // Standard reading
text-caption:     text-sm font-bold uppercase tracking-widest      // Labels
🧱 UI PHYSICS & EFFECTS
This is where the "Modern/Crazy" feel comes from. We reject "Flat Design" and "Material Design." We embrace Tactile Digitalism.

The "Hard" Shadow (The Signature Look)
TypeScript

// Tailwind Class
shadow-hard      // box-shadow: 4px 4px 0px 0px #1A1A1A
shadow-hard-lg   // box-shadow: 8px 8px 0px 0px #1A1A1A
shadow-hard-sm   // box-shadow: 2px 2px 0px 0px #1A1A1A
shadow-reverse   // box-shadow: -4px 4px 0px 0px #1A1A1A
Borders & Radius
TypeScript

rounded-none    // For a strict brutalist feel (Optional)
rounded-xl      // For a "Chunky" friendly feel (Recommended)
border-2        // Default border thickness
border-ink      // Border color (Black)
🧩 COMPONENT ARCHITECTURE
1. The "Power Button"
Don't just click; press.

TypeScript

// Primary Action
<button className="
  group relative px-6 py-3 rounded-xl 
  bg-primary text-white font-display font-bold text-lg tracking-wide
  border-2 border-ink
  shadow-[4px_4px_0px_0px_#1A1A1A]
  hover:translate-x-[2px] hover:translate-y-[2px] 
  hover:shadow-[2px_2px_0px_0px_#1A1A1A]
  active:translate-x-[4px] active:translate-y-[4px] 
  active:shadow-none
  transition-all duration-150 ease-out
">
  GENERATE BRIEFS
  {/* Optional: Cool decorative shine effect */}
  <div className="absolute inset-0 w-full h-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-shine" />
</button>

// Secondary / Ghost (The "Volt" Variant)
<button className="
  px-6 py-3 rounded-xl 
  bg-accent text-ink font-display font-bold
  border-2 border-ink
  shadow-[4px_4px_0px_0px_#1A1A1A]
  hover:bg-white transition-all duration-200
">
  Skip Card
</button>
2. The "Dossier" Card (Content Container)
Used for summarizing cases or listing features. Looks like a physical folder.

TypeScript

<div className="
  relative bg-white rounded-xl border-2 border-ink p-6
  shadow-[6px_6px_0px_0px_#1A1A1A]
">
  {/* Label Tag */}
  <span className="
    absolute -top-4 -right-2 -rotate-2
    bg-accent px-3 py-1 border-2 border-ink rounded-lg
    font-mono text-xs font-bold uppercase tracking-widest
  ">
    Criminal Law
  </span>

  <h3 className="font-display text-2xl font-bold text-ink mb-2">R v. Dudley and Stephens</h3>
  <p className="font-body text-ink-light leading-relaxed">
    Necessity is not a defense to a charge of murder. The cabin boy case.
  </p>
</div>
3. The "Mega-Flashcard" (Revision Mode)
A massive, immersive card that dominates the screen.

TypeScript

<div className="w-full max-w-2xl aspect-[3/2] perspective-1000">
  <div className="
    relative w-full h-full duration-500 preserve-3d
    cursor-pointer group
  ">
    {/* FRONT */}
    <div className="
      absolute inset-0 backface-hidden
      bg-paper-dark border-4 border-ink rounded-3xl
      flex flex-col items-center justify-center p-12
      shadow-[12px_12px_0px_0px_#5D3FD3] 
    ">
      <span className="font-mono text-primary font-bold text-sm mb-6 uppercase tracking-widest">
        Constitutional Law • Question 14
      </span>
      <h2 className="font-display text-4xl text-center font-bold text-ink leading-tight">
        What is the principle of <span className="text-primary bg-primary/10 px-2">Separation of Powers</span>?
      </h2>
      <p className="absolute bottom-8 text-ink-light text-sm font-mono animate-pulse">
        [ Click to Reveal ]
      </p>
    </div>

    {/* BACK */}
    <div className="
      absolute inset-0 backface-hidden rotate-y-180
      bg-ink text-paper rounded-3xl border-4 border-primary
      flex flex-col items-center justify-center p-12
      shadow-[12px_12px_0px_0px_#CCFF00]
    ">
       <p className="font-body text-xl leading-relaxed text-center">
         The division of government responsibilities into distinct branches to limit any one branch from exercising the core functions of another.
       </p>
    </div>
  </div>
</div>
4. Input Fields (The "Terminal" Aesthetic)
Make typing feel substantial.

TypeScript

<div className="space-y-2">
  <label className="font-mono text-xs font-bold uppercase text-ink">Upload Lecture Note</label>
  <input 
    type="text" 
    className="
      w-full px-4 py-4 bg-white 
      border-2 border-ink rounded-lg
      font-body text-lg placeholder:text-ink-lighter
      focus:outline-none focus:border-primary focus:shadow-[4px_4px_0px_0px_#5D3FD3]
      transition-all duration-200
    "
    placeholder="Paste topic or upload PDF..."
  />
</div>
🎼 AUDIO PLAYER (Podcast Mode)
Since the user listens to summaries, this needs to look like a modern synth/music app, not a browser default.

TypeScript

<div className="bg-ink rounded-2xl p-6 border-2 border-ink shadow-[8px_8px_0px_0px_#CCFF00]">
  <div className="flex items-center gap-4">
    {/* Album Art / Icon */}
    <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-400 rounded-lg border-2 border-white flex items-center justify-center">
      <span className="text-3xl">🎧</span>
    </div>
    
    {/* Track Info */}
    <div className="flex-1">
      <h4 className="text-white font-display font-bold text-lg">Tort Law Summary</h4>
      <div className="w-full bg-gray-700 h-2 rounded-full mt-3 overflow-hidden">
        <div className="bg-accent h-full w-2/3 relative">
             {/* Glowing Edge */}
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white shadow-[0_0_10px_#fff]"></div>
        </div>
      </div>
    </div>
    
    {/* Controls */}
    <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
      <div className="w-0 h-0 border-l-[12px] border-l-ink border-y-[8px] border-y-transparent ml-1"></div>
    </button>
  </div>
</div>
📐 LAYOUT PATTERNS: "The Grid"
The "Bento" Dashboard
Don't use lists. Use tiles.

TypeScript

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
  {/* Large Main Focus */}
  <div className="md:col-span-2 bg-primary text-white p-8 rounded-2xl border-2 border-ink shadow-hard">
    <h1 className="font-display text-4xl mb-4">Ready to crush Land Law?</h1>
    <Button variant="inverse">Resume Session</Button>
  </div>

  {/* Stat Card */}
  <div className="bg-accent p-6 rounded-2xl border-2 border-ink shadow-hard flex flex-col justify-between">
    <span className="font-mono text-sm font-bold">STREAK</span>
    <span className="font-display text-6xl">12🔥</span>
  </div>
</div>
⚡ ANIMATION GUIDE (Framer Motion)
Hover: scale: 1.02

Tap: scale: 0.98

Page Load: Staggered slide-up. Elements shouldn't just appear; they should slide in and "lock" into place with a spring bounce.
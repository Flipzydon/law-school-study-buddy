import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // THE BRAND CORE - Electric Iris
        primary: {
          DEFAULT: '#5D3FD3',
          hover: '#4B32C3',
          content: '#FFFFFF',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#5D3FD3',
          600: '#4B32C3',
          700: '#3B28A3',
          800: '#2E2080',
          900: '#1E1560',
        },
        // THE ENERGY - Volt (Acid Green)
        accent: {
          DEFAULT: '#CCFF00',
          hover: '#B3E600',
          content: '#000000',
          50: '#FDFFF0',
          100: '#F9FFD6',
          200: '#F0FFAD',
          300: '#E3FF70',
          400: '#D9FF3D',
          500: '#CCFF00',
          600: '#B3E600',
          700: '#8FB300',
          800: '#6B8500',
          900: '#475700',
        },
        // THE ALERTS - Radical Red
        danger: {
          DEFAULT: '#FF3366',
          content: '#FFFFFF',
          50: '#FFF0F3',
          100: '#FFE0E6',
          200: '#FFC0CC',
          300: '#FF99AA',
          400: '#FF6688',
          500: '#FF3366',
          600: '#E62E5C',
          700: '#CC2952',
          800: '#B32448',
          900: '#991F3E',
        },
        // THE CANVAS - Light Mode backgrounds
        paper: {
          DEFAULT: '#FDFBF7',
          dark: '#F2EFE9',
          border: '#1A1A1A',
        },
        // THE VOID - Dark Mode / Text
        ink: {
          DEFAULT: '#1A1A1A',
          light: '#404040',
          lighter: '#808080',
        },
        // Keep nigerian for backward compatibility
        nigerian: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#5D3FD3',
          600: '#4B32C3',
          700: '#3B28A3',
          800: '#2E2080',
          900: '#1E1560',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shine': 'shine 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%) skewX(-12deg)' },
          '100%': { transform: 'translateX(200%) skewX(-12deg)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(93, 63, 211, 0.3)',
        'glow-primary': '0 0 20px rgba(93, 63, 211, 0.3)',
        'glow-accent': '0 0 20px rgba(204, 255, 0, 0.4)',
        // Hard shadows (Neo-brutalist)
        'hard': '4px 4px 0px 0px #1A1A1A',
        'hard-sm': '2px 2px 0px 0px #1A1A1A',
        'hard-lg': '8px 8px 0px 0px #1A1A1A',
        'hard-xl': '12px 12px 0px 0px #1A1A1A',
        'hard-primary': '4px 4px 0px 0px #5D3FD3',
        'hard-accent': '4px 4px 0px 0px #CCFF00',
        'hard-reverse': '-4px 4px 0px 0px #1A1A1A',
      },
    },
  },
  plugins: [],
}
export default config

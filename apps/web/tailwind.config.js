/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FDFBF7',
          100: '#FAF6ED', // Warm parchment primary
          200: '#F4ECE0',
          300: '#EBDDC9',
          400: '#DFCAAC',
        },
        bark: {
          900: '#261C16',
          800: '#382A20',
          700: '#49372B', // Deep bark brown primary
          600: '#644D3D',
          500: '#846752',
          400: '#A7876E',
          100: '#EFEAE6',
        },
        forest: {
          900: '#2A3728',
          800: '#3D503A',
          700: '#536B4E', // Forest green primary
          600: '#688662',
          500: '#81A27A',
          100: '#E7EFE5',
        },
        sage: {
          50: '#F6F8F5',
          100: '#EBF0E8',
          200: '#DDE5D4', // Soft sage primary
          300: '#CAD6BF',
          400: '#B0C1A2',
        },
        gold: {
          100: '#FDF7EB',
          200: '#F9ECCB',
          300: '#F3DCA0',
          400: '#E9BC62', // Muted golden yellow
          500: '#D9A440',
        },
        terracotta: {
          100: '#FAECE7',
          200: '#F3D5CA',
          300: '#E5B19E',
          400: '#C87556', // Warm terracotta
          500: '#B05F41',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Playfair Display', 'Merriweather', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'bird-hop': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '40%': { transform: 'translateY(-18px) scale(0.96, 1.04)' },
          '60%': { transform: 'translateY(0) scale(1.05, 0.95)' },
        },
        'bird-dance': {
          '0%, 100%': { transform: 'rotate(0deg) translateY(0)' },
          '25%': { transform: 'rotate(-8deg) translateY(-8px)' },
          '50%': { transform: 'rotate(0deg) translateY(-2px)' },
          '75%': { transform: 'rotate(8deg) translateY(-8px)' },
        },
        'bird-sing': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08) translateY(-4px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        'bubble-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      },
      animation: {
        'bird-hop': 'bird-hop 0.8s cubic-bezier(0.28, 0.84, 0.42, 1) infinite',
        'bird-dance': 'bird-dance 1.2s ease-in-out infinite',
        'bird-sing': 'bird-sing 0.5s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'bubble-float': 'bubble-float 2.4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

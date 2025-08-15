/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/**/*.{js,jsx,ts,tsx}', // Make sure this covers all your JSX/TSX files
  ],
  theme: {
    extend: {
      colors: {
        'cine-dark': '#0A0A0A',
        'cine-darker': '#1A1A1A',
        'cine-gray': '#2A2A2A',
        'cine-light-gray': '#3A3A3A',
        'cine-gold': '#FFD700',
        'cine-gold-hover': '#FFED4E',
        'cine-red': '#E50914',
        'cine-red-hover': '#F40612',
        'cine-blue': '#0071EB',
        'cine-blue-hover': '#1A82FF',
        'cine-text': '#FFFFFF',
        'cine-text-secondary': '#B3B3B3',
        'cine-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      fontFamily: {
        'cine': ['Inter', 'system-ui', 'sans-serif'],
        'cine-display': ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'cine-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'cine-dark-gradient': 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
      },
      boxShadow: {
        'cine': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'cine-glow': '0 0 20px rgba(255, 215, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}


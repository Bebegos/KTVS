export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== HEARTHSTONE CLASSIC PALETTE (2014-era) =====
        // Wood board tones
        wood: {
          light: '#6b4a2b',
          DEFAULT: '#4a3119',
          dark: '#2e1d0e',
          darker: '#1c1208',
        },
        // Gold / bronze ornate frames
        gold: {
          light: '#f5e1a4',
          DEFAULT: '#d4af37',
          mid: '#c9a227',
          dark: '#9c7a1e',
          bronze: '#a87432',
        },
        // Parchment panels
        parchment: {
          light: '#f5e6c8',
          DEFAULT: '#e8d5a8',
          dark: '#d4b886',
          stone: '#c9b896',
        },
        // Gem colors
        gem: {
          health: '#c0392b',
          'health-dark': '#8b1a1a',
          mana: '#2e86de',
          'mana-dark': '#1b4f8c',
          attack: '#e8a317',
          'attack-dark': '#b8860b',
        },
        // Legacy aliases mapped to Hearthstone tones (so old components transform)
        dino: {
          50: '#f5e6c8',
          100: '#e8d5a8',
          200: '#d4b886',
          300: '#c9a227',
          400: '#d4af37',
          500: '#c9a227',
          600: '#a87432',
          700: '#9c7a1e',
          800: '#6b4a2b',
          900: '#4a3119',
        },
        neon: {
          cyan: '#d4af37',
          purple: '#c9a227',
          pink: '#c0392b',
          lime: '#e8a317',
        }
      },
      fontFamily: {
        sans: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Crimson Text"', '"Cinzel"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Cinzel', 'Georgia', 'serif'],
        hs: ['"Playfair Display"', 'Cinzel', 'Georgia', 'serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon-cyan': '0 0 16px rgba(212, 175, 55, 0.55), inset 0 1px 2px rgba(255,232,170,0.4)',
        'neon-purple': '0 0 16px rgba(201, 162, 39, 0.55), inset 0 1px 2px rgba(255,232,170,0.4)',
        'neon-pink': '0 0 16px rgba(192, 57, 43, 0.55), inset 0 1px 2px rgba(255,200,170,0.4)',
        'glass': '0 8px 24px 0 rgba(20, 12, 4, 0.6)',
        'gold': '0 0 14px rgba(212, 175, 55, 0.5), inset 0 1px 3px rgba(255,232,170,0.5)',
        'gold-lg': '0 4px 20px rgba(20, 12, 4, 0.7), 0 0 18px rgba(212, 175, 55, 0.45), inset 0 1px 4px rgba(255,232,170,0.6)',
        'inset-deep': 'inset 0 2px 8px rgba(0,0,0,0.6)',
      },
      borderColor: {
        'neon-cyan': '#d4af37',
        'neon-purple': '#c9a227',
        'neon-pink': '#c0392b',
        'gold': '#d4af37',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'wood-board': 'radial-gradient(ellipse at center, #4a3119 0%, #2e1d0e 70%, #1c1208 100%)',
        'parchment': 'linear-gradient(135deg, #f5e6c8 0%, #e8d5a8 50%, #d4b886 100%)',
        'gold-frame': 'linear-gradient(135deg, #f5e1a4 0%, #d4af37 45%, #9c7a1e 100%)',
      }
    },
  },
  plugins: [],
}

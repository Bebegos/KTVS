export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dino: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
        },
        neon: {
          cyan: '#00f3ff',
          purple: '#d946ef',
          pink: '#ff006e',
          lime: '#39ff14',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 243, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(217, 70, 239, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      borderColor: {
        'neon-cyan': '#00f3ff',
        'neon-purple': '#d946ef',
        'neon-pink': '#ff006e',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}

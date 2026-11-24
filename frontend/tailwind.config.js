import path from 'node:path'
import { fileURLToPath } from 'node:url'

const frontendRoot = path.dirname(fileURLToPath(import.meta.url))

export default {
  content: [
    path.join(frontendRoot, 'index.html'),
    path.join(frontendRoot, 'src/**/*.{js,jsx}'),
  ],
  theme: {
    extend: {
      colors: {
        // Deep Midnight Navy (Sidebar, Login backdrop, institutional dark cards)
        navy: {
          950: '#060a14',
          900: '#0b1329',
          850: '#0e1733',
          800: '#131e3d',
          750: '#18264d',
          700: '#1e305e',
          600: '#2a437f',
          500: '#3b5fa8',
        },
        // Institutional Gold / Amber Accents
        gold: {
          DEFAULT: '#d97706',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          soft: 'rgba(217, 119, 6, 0.12)',
        },
        // Soft public-service workspace surfaces
        surface: {
          950: '#0b1329',
          900: '#f1f5f9',
          850: '#f8fafc',
          800: '#ffffff',
          700: '#e2e8f0',
          600: '#cbd5e1',
          500: '#94a3b8',
          400: '#64748b',
          300: '#475569',
          200: '#334155',
          100: '#0f172a',
        },
        // Semantic civic palette
        gov: {
          saffron: '#ea580c',
          saffronLight: '#ffedd5',
          green: '#15803d',
          greenLight: '#dcfce7',
          blue: '#1d4ed8',
          blueLight: '#dbeafe',
          teal: '#0f766e',
          tealLight: '#ccfbf1',
          crimson: '#dc2626',
          crimsonLight: '#fee2e2',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        body:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono:    ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
        serif:   ['"Times New Roman"', 'Times', 'serif'],
      },
      boxShadow: {
        'gov': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'gov-card': '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'gov-elevated': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        'gov-glow': '0 0 25px rgba(217, 119, 6, 0.25)',
      },
    },
  },
  plugins: [],
}

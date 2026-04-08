/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        indigo: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fd',
          300: '#b1c2fa',
          400: '#7695f7',
          500: '#3b67f3',
          600: '#254ceb',
          700: '#1c39af',
          800: '#152b84',
          900: '#11226c',
        },
        violet: {
          50: '#fbf7ff',
          100: '#f7f0fe',
          200: '#ead9fd',
          300: '#ddc2fa',
          400: '#c295f7',
          500: '#a767f3',
          600: '#8a4ceb',
          700: '#6739af',
          800: '#4e2b84',
          900: '#40226c',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        risk: '#F43F5E',
        info: '#0ea5e9',
        card: '#ffffff',
        background: '#f8fafc',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.05)',
        'glass-hover': '0 10px 40px rgba(79, 70, 229, 0.1)',
        'premium': '0 20px 50px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 30px 60px rgba(79, 70, 229, 0.12)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-gradient': "url('https://grainy-gradients.vercel.app/noise.svg')",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}

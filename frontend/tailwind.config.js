/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Dynamic CSS variables for adaptive theming
      colors: {
        'theme-primary': {
          from: 'var(--theme-primary-from, #14b8a6)', // turquoise-500
          via: 'var(--theme-primary-via, #0d9488)', // teal-600
          to: 'var(--theme-primary-to, #06b6d4)', // cyan-500
        },
      },
      
      // Custom gradient colors for consistency
      backgroundImage: {
        // Primary gradients (turquoise theme - CHANGED from purple)
        'gradient-primary': 'linear-gradient(135deg, rgba(20, 184, 166, 0.9) 0%, rgba(13, 148, 136, 0.95) 50%, rgba(6, 182, 212, 1) 100%)',
        'gradient-primary-soft': 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(13, 148, 136, 0.15) 50%, rgba(6, 182, 212, 0.2) 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, rgba(20, 184, 166, 1) 0%, rgba(13, 148, 136, 1) 50%, rgba(6, 182, 212, 1) 100%)',
        
        // Success gradients (green theme)
        'gradient-success': 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.95) 50%, rgba(21, 128, 61, 1) 100%)',
        'gradient-success-soft': 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.15) 50%, rgba(21, 128, 61, 0.2) 100%)',
        
        // Warning gradients (yellow theme)
        'gradient-warning': 'linear-gradient(135deg, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.95) 50%, rgba(217, 119, 6, 1) 100%)',
        'gradient-warning-soft': 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.15) 50%, rgba(217, 119, 6, 0.2) 100%)',
        
        // Danger gradients (red theme)
        'gradient-danger': 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.95) 50%, rgba(185, 28, 28, 1) 100%)',
        'gradient-danger-soft': 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.15) 50%, rgba(185, 28, 28, 0.2) 100%)',
        
        // Info gradients (blue theme)
        'gradient-info': 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.95) 50%, rgba(29, 78, 216, 1) 100%)',
        'gradient-info-soft': 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.15) 50%, rgba(29, 78, 216, 0.2) 100%)',
        
        // Neutral gradients (gray theme)
        'gradient-dark': 'linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(17, 24, 39, 0.95) 50%, rgba(0, 0, 0, 1) 100%)',
        'gradient-light': 'linear-gradient(135deg, rgba(249, 250, 251, 0.9) 0%, rgba(243, 244, 246, 0.95) 50%, rgba(229, 231, 235, 1) 100%)',
        
        // Glassmorphism backgrounds
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'gradient-glass-dark': 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)',
        
        // Radial highlights (turquoise theme)
        'radial-highlight': 'radial-gradient(circle at top right, rgba(20, 184, 166, 0.15) 0%, transparent 50%)',
        'radial-highlight-center': 'radial-gradient(circle at center, rgba(20, 184, 166, 0.1) 0%, transparent 70%)',
        'radial-highlight-soft': 'radial-gradient(circle at top left, rgba(255, 255, 255, 0.1) 0%, transparent 60%)',
        
        // Mesh gradients (complex multi-color with turquoise)
        'gradient-mesh': 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(34, 197, 94, 0.15) 100%)',
        'gradient-mesh-warm': 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(239, 68, 68, 0.1) 50%, rgba(20, 184, 166, 0.15) 100%)',
      },
      
      // Custom backdrop blur utilities
      backdropBlur: {
        'xs': '2px',
        'glass': '12px',
      },
      
      // Multi-layered custom shadows for depth and consistency
      boxShadow: {
        // Glassmorphism shadows
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
        'glass-lg': '0 16px 48px 0 rgba(31, 38, 135, 0.5)',
        
        // Glow effects (turquoise theme)
        'glow': '0 0 20px rgba(20, 184, 166, 0.5)',
        'glow-sm': '0 0 10px rgba(20, 184, 166, 0.3)',
        'glow-lg': '0 0 30px rgba(20, 184, 166, 0.6)',
        
        // Multi-layered card shadows (subtle depth with turquoise)
        'card': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08), 0 0 20px rgba(20, 184, 166, 0.1)',
        'card-lg': '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
        
        // Input shadows (turquoise theme)
        'input': '0 1px 2px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(0, 0, 0, 0.03)',
        'input-focus': '0 0 0 3px rgba(20, 184, 166, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05)',
        
        // Button shadows (turquoise theme)
        'button': '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'button-hover': '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.08), 0 0 12px rgba(20, 184, 166, 0.2)',
        
        // Modal shadows
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'modal-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        
        // Navbar shadow
        'navbar': '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
      },
      
      // Animation utilities
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    // Custom plugin for glassmorphism utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-card': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}

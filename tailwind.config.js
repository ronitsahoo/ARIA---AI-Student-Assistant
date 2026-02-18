/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            colors: {
                neon: {
                    blue: '#00D4FF',
                    darkBlue: '#0070F3',
                    purple: '#7928CA',
                    magenta: '#FF0080',
                    pink: '#FF4D4D',
                    green: '#10B981',
                    yellow: '#F5A623',
                },
                dark: {
                    bg: '#000000',
                    panel: '#0C0C0C',
                    card: '#111111',
                    input: '#1A1A1A'
                },
                light: {
                    bg: '#F3F4F6',
                    panel: '#FFFFFF',
                    card: '#FFFFFF',
                    input: '#F9FAFB',
                    text: '#111827',
                    subtext: '#6B7280'
                }
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        },
    },
    plugins: [],
}

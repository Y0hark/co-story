/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                charcoal: {
                    700: '#334155', // Adjust based on design system
                    800: '#1e293b',
                    900: '#0f172a',
                },
                teal: {
                    300: '#5eead4',
                    400: '#2dd4bf',
                }
            },
            fontFamily: {
                sans: ['Geist', 'Inter', 'sans-serif'],
                serif: ['Lora', 'serif'],
            }
        },
    },
    plugins: [],
}

/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './services/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#06b6d4', // Cyan
                surface: '#ffffff', // Pure White
                background: '#f0f9ff', // Glacial Blue
                text: '#0f172a', // Dark Slate
            },
        },
    },
    plugins: [
        plugin(function ({ addUtilities }) {
            addUtilities({
                '.glass': {
                    'background-color': 'rgba(255, 255, 255, 0.7)',
                    'backdrop-filter': 'blur(10px)',
                    '-webkit-backdrop-filter': 'blur(10px)',
                    'border': '1px solid rgba(255, 255, 255, 0.3)',
                },
                '.glass-dark': {
                    'background-color': 'rgba(15, 23, 42, 0.6)',
                    'backdrop-filter': 'blur(10px)',
                    '-webkit-backdrop-filter': 'blur(10px)',
                    'border': '1px solid rgba(255, 255, 255, 0.1)',
                }
            })
        })
    ],
}

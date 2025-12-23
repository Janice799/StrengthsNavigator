import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'ocean': {
                    50: '#e6eef5',
                    100: '#ccdcea',
                    200: '#99b9d5',
                    300: '#6697c0',
                    400: '#3374ab',
                    500: '#1e3a5f',
                    600: '#1a3352',
                    700: '#152b45',
                    800: '#112238',
                    900: '#0c1a2b',
                },
                'gold': {
                    50: '#fdf9ed',
                    100: '#faf3db',
                    200: '#f5e7b7',
                    300: '#f0db93',
                    400: '#ebcf6f',
                    500: '#d4af37',
                    600: '#aa8c2c',
                    700: '#806921',
                    800: '#554616',
                    900: '#2b230b',
                },
            },
            fontFamily: {
                sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.8)' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'shimmer': 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)',
            },
        },
    },
    plugins: [],
};

export default config;

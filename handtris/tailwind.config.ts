import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backdropFilter: {
                'none': 'none',
                'blur': 'blur(20px)',
            },
            backgroundColor: {
                'glass': 'rgba(255, 255, 255, 0.3)',
            },
            fontSize: {
                base: ['1rem', { lineHeight: '1.5', letterSpacing: '0' }],
            },
            colors: {
                'green400': '#1D3E2A',
                'green300': "#4AA645",
                'green200': "#51C063",
                'green100': "#88FF99"
            },
            keyframes: {
                winAnimation: {
                    '0%': { opacity: '0', transform: 'translate(-50%, -50%) scale(0.5)' },
                    '50%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1.2)' },
                    '100%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
                },
                loseAnimation: {
                    '0%': { opacity: '0', transform: 'translate(-50%, -50%) translateY(-20px)' },
                    '50%': { opacity: '1', transform: 'translate(-50%, -50%) translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translate(-50%, -50%) translateY(0)' },
                },
            },
            animation: {
                win: 'winAnimation 1.5s forwards',
                lose: 'loseAnimation 1.5s forwards',
            },
            inset: {
                '-50px': '-50px',
            },
            spacing: {
                '30px': '30px',
                '800px': '800px',
            },
        },
        variants: {
            extends: {
                translate: ['hover', 'focus'],
            }
        },
    },
    plugins: [],
};

export default config;

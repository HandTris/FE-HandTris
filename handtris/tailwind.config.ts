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

            }
        },
    },
    plugins: [],
};
export default config;

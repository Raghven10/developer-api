import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary)',
                'primary-hover': 'var(--primary-hover)',
                surface: 'var(--surface)',
                'surface-hover': 'var(--surface-hover)',
                border: 'var(--border)',
                foreground: 'var(--foreground)',
                background: 'var(--background)',
            },
        },
    },
    plugins: [],
}
export default config

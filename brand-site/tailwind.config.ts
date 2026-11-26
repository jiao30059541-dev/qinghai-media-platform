import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0a0d10',
        paper: '#f6f4ef',
        signal: '#e5362c',
        sky: '#9fd8ff',
        line: 'rgba(10,13,16,.14)',
      },
      boxShadow: {
        lift: '0 24px 64px rgba(10,13,16,.14)',
      },
    },
  },
  plugins: [],
}

export default config

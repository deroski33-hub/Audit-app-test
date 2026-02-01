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
        // Big 4 inspired professional colors
        'audit-primary': '#1e3a5f',
        'audit-secondary': '#2c5282',
        'audit-accent': '#3182ce',
        'audit-success': '#38a169',
        'audit-warning': '#d69e2e',
        'audit-error': '#e53e3e',
      },
    },
  },
  plugins: [],
}
export default config

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vibe-blue': '#667eea',
        'vibe-purple': '#764ba2',
        'cost-green': '#00ff00',
        'blockchain-purple': '#8a2be2',
      },
      backgroundImage: {
        'vibe-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'cost-gradient': 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)',
        'blockchain-gradient': 'linear-gradient(135deg, #8a2be2 0%, #6a1b9a 100%)',
      },
    },
  },
  plugins: [],
}

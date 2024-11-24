import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['NeoDunggeunmo', 'sans-serif'],
        serif: ['NeoDunggeunmo', 'serif'],
        mono: ['NeoDunggeunmo', 'monospace'],
      },
    },
  },
  plugins: [
    function({ addBase }) {
      addBase({
        '@font-face': {
          fontFamily: 'NeoDunggeunmo',
          src: 'url("/resource/neodgm.woff") format("woff")',
          fontWeight: 'normal',
          fontStyle: 'normal'
        }
      });
    }
  ],
};

export default config;
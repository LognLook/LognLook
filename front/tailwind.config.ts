import type { Config } from 'tailwindcss'
import { PluginAPI } from 'tailwindcss/types/config'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    function({ addBase }: PluginAPI) {
      addBase({
        'input[type="checkbox"]': {
          '&:checked': {
            backgroundColor: '#1E435F !important',
            borderColor: '#1E435F !important',
            color: '#1E435F !important',
            '&:hover': {
              backgroundColor: '#1E435F !important',
              borderColor: '#1E435F !important',
            },
          },
          '&:not(:checked)': {
            backgroundColor: 'transparent !important',
            borderColor: '#E5E5EC !important',
            '&:hover': {
              backgroundColor: 'transparent !important',
              borderColor: '#E5E5EC !important',
            },
          },
          '&:focus': {
            boxShadow: 'none !important',
            borderColor: '#E5E5EC !important',
          },
          '&:focus:checked': {
            boxShadow: 'none !important',
            borderColor: '#1E435F !important',
          },
        },
      })
    },
  ],
} satisfies Config 
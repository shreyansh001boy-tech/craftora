import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/fabric')) return 'vendor-fabric'
          if (id.includes('@emoji-mart')) return 'vendor-emoji'
          if (id.includes('@dnd-kit')) return 'vendor-dnd'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('@radix-ui')) return 'vendor-radix'
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@sailrite/calc-shell': path.resolve(rootDir, '../../packages/shell/src'),
      '@sailrite/calc-registry': path.resolve(rootDir, '../../packages/registry/src'),
      '@sailrite/calc-nesting': path.resolve(rootDir, '../../packages/calculators/nesting/src'),
      '@sailrite/calc-pillows': path.resolve(rootDir, '../../packages/calculators/pillows/src'),
    },
  },
  server: {
    fs: {
      allow: [path.resolve(rootDir, '../..')],
    },
  },
})

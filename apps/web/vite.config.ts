/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const reactPath = path.resolve(rootDir, 'node_modules/react')
const reactDomPath = path.resolve(rootDir, 'node_modules/react-dom')
const reactRouterDomPath = path.resolve(rootDir, 'node_modules/react-router-dom')

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
    alias: [
      // Exact package roots only — do not swallow react/jsx-runtime subpaths.
      { find: /^react$/, replacement: reactPath },
      { find: /^react-dom$/, replacement: reactDomPath },
      { find: /^react-router-dom$/, replacement: reactRouterDomPath },
      {
        find: '@sailrite/calc-shell',
        replacement: path.resolve(rootDir, '../../packages/shell/src'),
      },
      {
        find: '@sailrite/calc-registry',
        replacement: path.resolve(rootDir, '../../packages/registry/src'),
      },
      {
        find: '@sailrite/calc-nesting',
        replacement: path.resolve(rootDir, '../../packages/calculators/nesting/src'),
      },
      {
        find: '@sailrite/calc-pillows',
        replacement: path.resolve(rootDir, '../../packages/calculators/pillows/src'),
      },
    ],
  },
  server: {
    fs: {
      allow: [path.resolve(rootDir, '../..')],
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
})

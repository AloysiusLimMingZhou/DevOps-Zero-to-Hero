import { defineConfig } from "vitest/config";
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.integration.spec.ts'],
    exclude: [
        'node_modules/**',
        'dist/**'
    ],
  },
});
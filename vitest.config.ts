import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: [
        'src/lib/availability.ts',
        'src/lib/dates.ts',
        'src/lib/names.ts',
        'src/lib/storage.ts',
        'src/lib/validation.ts',
      ],
      exclude: ['**/*.test.ts'],
    },
  },
})

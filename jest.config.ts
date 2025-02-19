import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^lib/(.*)$': '<rootDir>/lib/$1'
  },
  transform: {
    '^.+\\.(t|j)sx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@radix-ui|lucide-react)/)'
  ],
  testMatch: ['**/*.test.ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
}

export default config 
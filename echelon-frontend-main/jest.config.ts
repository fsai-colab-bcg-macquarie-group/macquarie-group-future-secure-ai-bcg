import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const config: Config = {
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!<rootDir>/out/**',
    '!<rootDir>/.next/**',
    '!<rootDir>/*.config.js',
    '!<rootDir>/coverage/**',
    '!<rootDir>/.scannerwork/**',
    '!<rootDir>/jest.config.ts',
  ],

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['<rootDir>/jest.config.ts'],

  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: undefined,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    "@/*": "<rootDir>/*",
    "@interfaces/*": "<rootDir>/app/_private/interfaces/*",
    "@public/*": "<rootDir>/public/*",
    "@contexts/*": "<rootDir>/app/_private/contexts/*",
    "@components/*": "<rootDir>/app/_private/components/*",
    "@hooks/*": "<rootDir>/app/_private/hooks/*",
    "@_types/*": "<rootDir>/app/_private/types/*",
    "@definitions/*": "<rootDir>/app/_private/definitions/*",
    "@actions/*": "<rootDir>/app/_private/actions/*",
    "@assets/*": "<rootDir>/app/assets/*",
    "@services/*": "<rootDir>/services/*",
    "@enum/*": "<rootDir>/app/_private/enum/*",
    "@icons/*": "<rootDir>/app/assets/icons/*",
    "@mappers/*": "<rootDir>/app/_private/mappers/*",
    "@helpers/*": "<rootDir>/app/_private/helpers/*",
    "@utils/*": "<rootDir>/app/_private/utils/*",
    "@config/*": "<rootDir>/app/config/*",
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)

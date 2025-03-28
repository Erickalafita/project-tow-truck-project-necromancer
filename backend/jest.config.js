module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // For resolving import aliases
  },
  modulePaths: ['<rootDir>'],          // Allows absolute imports
  setupFilesAfterEnv: ['./test/setup.ts'],
  testMatch: [
    "**/tests/**/*.test.ts",
    "**/test/**/*.test.ts"
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
};

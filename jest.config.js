module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js',
  },
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/services/main.test.js'
  ],
  testPathIgnorePatterns: ['<rootDir>/src/__tests__/services/main.test.js'],
  modulePaths: ['<rootDir>/src/renderer'],
};
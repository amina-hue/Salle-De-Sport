// module.exports = {
//   testEnvironment: 'jsdom',
//   setupFilesAfterFramework: ['@testing-library/jest-dom'],
//   transform: {
//     '^.+\\.(js|jsx)$': 'babel-jest',
//   },
//   moduleNameMapper: {
//     '\\.(png|jpg|jpeg|svg|gif|css)$': '<rootDir>/__mocks__/fileMock.cjs',
//   },
// };

module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transform: { '^.+\\.(js|jsx)$': 'babel-jest' },
  moduleNameMapper: { '\\.(png|jpg|jpeg|svg|gif|css)$': '<rootDir>/__mocks__/fileMock.cjs' },
};

module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEach: ['@testing-library/jest-dom'],
  transform: { '^.+\\.(js|jsx)$': 'babel-jest' },
  moduleNameMapper: { '\\.(png|jpg|jpeg|svg|gif|css)$': '<rootDir>/__mocks__/fileMock.cjs' },
  testPathIgnorePatterns: ['/node_modules/'],
};
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
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: { '^.+\\.(js|jsx)$': 'babel-jest' },
  moduleNameMapper: {
    '\\.(png|jpg|jpeg|svg|gif|css)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testPathIgnorePatterns: ['/node_modules/'],
};

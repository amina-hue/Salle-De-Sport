<<<<<<< HEAD
module.exports = { testEnvironment: 'jsdom', setupFiles: ['<rootDir>/jest.setup.js'], transform: { '^.+\\.(js|jsx)$': 'babel-jest' }, moduleNameMapper: { '\\.(png|jpg|jpeg|svg|gif|css)$': '<rootDir>/__mocks__/fileMock.js' }, testMatch: ['**/src/tests/**/*.test.{js,jsx}', '**/src/__tests__/**/*.test.{js,jsx}'], testPathIgnorePatterns: ['/node_modules/'] };
=======
module.exports = {
  testEnvironment: "jsdom",
   setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(png|jpg|jpeg|gif|svg|webp|ico)$": "<rootDir>/src/__mocks__/fileMock.js",
    "\\.(css|scss|sass|less)$": "identity-obj-proxy",
  },
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],
};
>>>>>>> sonia

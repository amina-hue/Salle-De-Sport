module.exports = {
  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["@testing-library/jest-dom"],

  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },

  moduleNameMapper: {
    "\\.(png|jpg|jpeg|svg|gif|css)$": "<rootDir>/mocks/fileMock.js",
  },
};
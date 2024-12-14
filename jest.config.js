/** @type {import('jest').Config} */

const config = {
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "node",
  setupFiles: ["./jest.setup.js"],
  transform: {
    "^.+\\.js$": "babel-jest", // Use Babel for transforming JS files
  },
  detectOpenHandles: true, // Debug open handles
};

module.exports = config;

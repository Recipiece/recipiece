module.exports = {
  moduleFileExtensions: ["ts", "js"],
  moduleNameMapper: {
    "@recipiece/types": "<rootDir>/../recipiece_common/recipiece_types/src",
  },
  transform: {
    "^.+\\.ts$": ["@swc/jest"],
  },
  testMatch: ["**/test/**/*.test.ts"], // Match test files
  collectCoverage: true, // Enable test coverage collection
  collectCoverageFrom: ["src/**/*.ts"] // Include only src files in coverage report
};

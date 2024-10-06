export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.ts$": "ts-jest", // Transform TypeScript files using ts-jest
  },
  testMatch: ["**/test/**/*.ts", "**/?(*.)+(spec|test).ts"], // Match test files
  collectCoverage: true, // Enable test coverage collection
  collectCoverageFrom: ["src/**/*.ts"], // Include only src files in coverage report
  setupFilesAfterEnv: ["./jest.setup.ts"],
};

export default {
  preset: "ts-jest",
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {isolatedModules: true}], // Transform TypeScript files using ts-jest
  },
  testMatch: ["**/test/**/*.ts", "**/?(*.)+(spec|test).ts"], // Match test files
  collectCoverage: true, // Enable test coverage collection
  collectCoverageFrom: ["src/**/*.ts"], // Include only src files in coverage report
  globalSetup: "./jest.setup-global.ts",
  setupFilesAfterEnv: ["jest-expect-message", "./jest.setup.ts"],
  testEnvironment: "@quramy/jest-prisma-node/environment",
  testEnvironmentOptions: {
    // Optional: Enable experimental rollback in transactions (for PostgreSQL)
    enableExperimentalRollbackInTransaction: true,
  },
  // reporters: ["jest-silent-reporter"],
};

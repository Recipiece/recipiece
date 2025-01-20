export default {
  preset: "ts-jest",
  moduleFileExtensions: ["ts", "js"],
  moduleNameMapper: {
    "@recipiece/database": "<rootDir>/../recipiece_common/recipiece_database/src",
    "@recipiece/types": "<rootDir>/../recipiece_common/recipiece_types/src",
    "@recipiece/test": "<rootDir>/../recipiece_common/recipiece_test/src",
  },
  resolver: "ts-jest-resolver",
  transform: {
    "^.+\\.ts$": ["ts-jest", { isolatedModules: true }], // Transform TypeScript files using ts-jest
  },
  testMatch: ["**/test/**/*.ts", "**/?(*.)+(spec|test).ts"], // Match test files
  collectCoverage: true, // Enable test coverage collection
  collectCoverageFrom: ["src/**/*.ts"], // Include only src files in coverage report
  globalSetup: "./jest.setup-global.ts",
  setupFilesAfterEnv: ["jest-expect-message", "./jest.setup.ts"],
};

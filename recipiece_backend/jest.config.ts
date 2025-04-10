export default {
  preset: "ts-jest",
  moduleFileExtensions: ["ts", "js"],
  moduleNameMapper: {
    "@recipiece/database": "<rootDir>/../recipiece_common/recipiece_database/src",
    "@recipiece/types": "<rootDir>/../recipiece_common/recipiece_types/src",
    "@recipiece/test": "<rootDir>/../recipiece_common/recipiece_test/src",
    "@recipiece/conversion": "<rootDir>/../recipiece_common/recipiece_conversion/src",
    "@recipiece/constant": "<rootDir>/../recipiece_common/recipiece_constant/src",
  },
  resolver: "ts-jest-resolver",
  transform: {
    "^.+\\.ts$": ["ts-jest", { isolatedModules: true }], // Transform TypeScript files using ts-jest
  },
  testMatch: ["**/test/**/*.test.ts"], // Match test files
  collectCoverage: true, // Enable test coverage collection
  collectCoverageFrom: ["src/**/*.ts"], // Include only src files in coverage report
  globalSetup: "./jest.setup-global.ts",
  setupFilesAfterEnv: ["jest-expect-message", "./jest.setup.ts"],
};

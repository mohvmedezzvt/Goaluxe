// jest.config.ts
import nextJest from "next/jest";
import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json"; // Adjust if necessary

const createJestConfig = nextJest({
  dir: "./", // Path to your Next.js app
});

const customJestConfig = {
  preset: "ts-jest",

  // Setup for jest-dom and other testing libraries
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Path aliases mapping
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy", // Handle CSS Modules
  },
  testEnvironmentOptions: {
    experimentalVmModules: true,
  },
  testEnvironment: "jsdom",
};

export default createJestConfig(customJestConfig);

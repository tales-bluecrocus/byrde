import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      diagnostics: false,
      astTransformers: {
        before: ['<rootDir>/src/__mocks__/importMeta.cjs'],
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/src/__mocks__/fileMock.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
};

export default config;

/** @type {import('jest').Config} */
module.exports = {
  // Le scaffold ne teste que la logique métier pure (`src/domain`, `src/data`),
  // qui n'importe ni react-native ni expo-*. On utilise donc babel-jest en
  // environnement node, sans le préset jest-expo.
  // Pour tester des composants RN plus tard : ajouter `jest-expo` et un projet
  // Jest dédié (voir ARCHITECTURE.md).
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/domain/**/*.ts', 'src/data/**/*.ts'],
};

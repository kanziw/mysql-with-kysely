/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testPathIgnorePatterns: [
    'dist/',
    '__tests__/integration.spec.ts',
    '__tests__/fixtures/',
  ],
}

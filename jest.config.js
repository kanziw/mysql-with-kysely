/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testPathIgnorePatterns: [
    '__tests__/integration*.ts',
    '__tests__/fixtures/',
  ],
}

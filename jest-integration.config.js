/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  ...require('./jest.config.js'),
  testPathIgnorePatterns: ['/dist'],
  testMatch: [
    '**/__tests__/integration*.ts',
  ],
}

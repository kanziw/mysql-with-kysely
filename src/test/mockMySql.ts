import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import type { Pool, PoolConnection } from 'mysql2/promise'

import { MySql, mysql } from '../index'
import { wrapUnknownError } from '../lib'

type MockMySql = DeepMockProxy<Pool> & {
  _mockPoolConnection: DeepMockProxy<PoolConnection>,
};

type MockMySqlCallOption = { withBeginTransaction?: boolean };
type MockMySqlHelper<Database> = {
  db: MySql<Database>;
  mockMySqlCall: <Response>(
    expectedSql: string,
    args: unknown[],
    resp: Response | Response[] | Error,
    options?: MockMySqlCallOption,
  ) => void;
  checkExecutedSqls: () => void;
}

export const createMockMySqlHelper = <Database>(): MockMySqlHelper<Database> => {
  const mockMySql = mockDeep<Pool>() as MockMySql
  const mockPoolConnection = mockDeep<PoolConnection>()

  mockMySql.getConnection.mockImplementation(() => Promise.resolve(mockPoolConnection))
  mockMySql._mockPoolConnection = mockPoolConnection

  const sqlAndArgs: Array<[string, unknown[]]> = []
  let transactionCount = 0

  return {
    db: mysql<Database>(mockMySql),
    mockMySqlCall: (
      expectedSql,
      args,
      resp,
      { withBeginTransaction }: MockMySqlCallOption = { withBeginTransaction: false },
    ): void => {
      if (withBeginTransaction) {
        transactionCount += 1
      }
      sqlAndArgs.push([expectedSql, args])

      if (resp instanceof Error) {
        mockMySql._mockPoolConnection.execute.mockRejectedValueOnce(resp)
        return
      }
      // @ts-ignore
      mockMySql._mockPoolConnection.execute.mockResolvedValueOnce([resp])
    },
    checkExecutedSqls: () => {
      try {
        mockMySql._mockPoolConnection.execute.mock.calls.forEach((call, idx) => {
          try {
            expect(call).toEqual(sqlAndArgs[idx])
          } catch (unknownErr: unknown) {
            const err = wrapUnknownError(unknownErr)
            err.name = `${err.name} at idx: ${idx}`
            throw err
          }
        })
        expect(mockMySql._mockPoolConnection.execute.mock.calls.length).toBe(sqlAndArgs.length)
        expect(mockMySql._mockPoolConnection.beginTransaction.mock.calls.length)
          .toBe(transactionCount)

        mockMySql._mockPoolConnection.execute.mockClear()
        mockMySql._mockPoolConnection.beginTransaction.mockClear()
        sqlAndArgs.splice(0)
        transactionCount = 0
      } catch (err: unknown) {
        console.log(`
Invalid MySQL Mocking Founded. Executed sqls:
${mockMySql._mockPoolConnection.execute.mock.calls
    .map(([executedSql]) => `  - ${executedSql}`)
    .join('\n')}`)
        throw err
      }
    },
  }
}

export class FakeDuplicateError extends Error {
  errno = 1062
  message = 'Mocked Duplicate Error'
}

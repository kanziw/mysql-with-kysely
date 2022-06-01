import { mockDeep } from 'jest-mock-extended'
import { Pool, PoolConnection } from 'mysql2/promise'
import { mysql } from '../mysql'
import { setTimeout as delay } from 'timers/promises'

describe('mysql', () => {
  const prepareTests = () => {
    const mockMySqlPool = mockDeep<Pool>()
    const db = mysql(mockMySqlPool)

    const mockPoolConnection = mockDeep<PoolConnection>()
    mockMySqlPool.getConnection.mockResolvedValue(mockPoolConnection)

    return {
      db,
      mockMySqlPool,
      mockPoolConnection,
    }
  }

  describe('ping', () => {
    test('success', async() => {
      const { mockMySqlPool, mockPoolConnection, db } = prepareTests()
      mockPoolConnection.ping.mockResolvedValueOnce()

      await db.ping()

      expect(mockMySqlPool.getConnection).toBeCalledTimes(1)
      expect(mockPoolConnection.ping).toBeCalledTimes(1)
    })

    test('failure w/ timeout', async() => {
      const { mockMySqlPool, mockPoolConnection, db } = prepareTests()
      mockPoolConnection.ping.mockImplementationOnce(async() => {
        await delay(1000)
      })

      await expect(db.ping({ timeoutMs: 500 })).rejects.toThrow('MySQL ping failed')

      expect(mockMySqlPool.getConnection).toBeCalledTimes(1)
      expect(mockPoolConnection.ping).toBeCalledTimes(1)
    })
  })
})

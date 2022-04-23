import { qb } from './fixtures/mysql'
import { createMockMySqlHelper } from '../test'
import { SqlQueryMetric } from '../mysql'

describe('Subscribe', () => {
  test('add subscriber', async() => {
    const { db } = createMockMySqlHelper()

    const sqlQueryMetrics: SqlQueryMetric[] = []
    db.subscribe(sqlQueryMetric => sqlQueryMetrics.push(sqlQueryMetric))

    await db.query(qb.selectFrom('user').selectAll().where('id', 'in', ['1', '2']))

    expect(sqlQueryMetrics).toHaveLength(1)
    expect(sqlQueryMetrics[0]).toEqual(expect.objectContaining({
      sql: 'select * from `user` where `id` in (?, ?)',
      parameters: ['1', '2'],
      normalizedSql: 'select * from `user` where `id` in (?)',
    }))
  })

  test('add subscriber multiple', async() => {
    const TIMES = 3

    const { db } = createMockMySqlHelper()

    const sqlQueryMetrics: SqlQueryMetric[] = []
    new Array(TIMES).fill(null).forEach(() => {
      db.subscribe(sqlQueryMetric => sqlQueryMetrics.push(sqlQueryMetric))
    })

    await db.query(qb.selectFrom('user').selectAll().where('id', '=', '1'))

    expect(sqlQueryMetrics).toHaveLength(TIMES)
    for (const sqlQueryMetric of sqlQueryMetrics) {
      expect(sqlQueryMetric).toEqual(expect.objectContaining({
        sql: 'select * from `user` where `id` = ?',
        parameters: ['1'],
        normalizedSql: 'select * from `user` where `id` = ?',
      }))
    }
  })
})

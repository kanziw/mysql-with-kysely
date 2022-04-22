import { WithSchema, connect, queryBuilder } from '../index'
import type { User } from './fixtures/model'

type Database = {
  user: WithSchema<User>
}

describe('MySQL with Kysely', () => {
  const { db, close } = connect<Database>()
  const qb = queryBuilder<Database>()

  afterAll(() => close())

  describe('Connection', () => {
    test('ping', async () => {
      await db.ping()
    })
  })

  describe('Select', () => {
    it('success', async () => {
      const users = await db.query(qb
        .selectFrom('user')
        .selectAll()
        .orderBy('id', 'desc')
        .limit(1),
      )

      expect(users).toEqual([])
    })
  })
})

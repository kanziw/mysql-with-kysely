import { WithSchema, connect, queryBuilder } from '../index'
import type { User } from './fixtures/model'

type Database = {
  user: WithSchema<User>
}

describe('MySQL with Kysely', () => {
  const { db, close } = connect<Database>()
  const qb = queryBuilder<Database>()

  beforeAll(() => db.truncate('user'))
  afterAll(() => close())

  describe('Connection', () => {
    test('ping', async () => {
      await db.ping()
    })
  })

  describe('Query', () => {
    test('select', async () => {
      const users = await db.query(qb
        .selectFrom('user')
        .selectAll()
        .orderBy('id', 'desc')
        .limit(1),
      )

      expect(users).toEqual([])
    })
  })

  describe('Execute', () => {
    test('insert', async () => {
      const { insertId } = await db.execute(qb
        .insertInto('user')
        .values({
          name: 'kanziw',
          email: 'kanziwoong@gmail.com',
        }),
      )

      expect(insertId).toBe(1)
    })

    test('update', async () => {
      const { affectedRows } = await db.execute(qb
        .updateTable('user')
        .set({ name: 'kanziw' })
        .where('id', '=', '9999'),
      )

      expect(affectedRows).toBe(0)
    })

    test('delete', async () => {
      const { affectedRows } = await db.execute(qb
        .deleteFrom('user')
        .where('id', '=', '9999'),
      )
      expect(affectedRows).toBe(0)
    })
  })
})

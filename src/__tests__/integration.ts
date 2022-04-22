import { Database, qb } from './fixtures/mysql'
import { connect } from '../index'

describe.skip('Integration Test with Real MySQL Connection', () => {
  const { db, close } = connect<Database>({ uri: 'mysql://root:root@localhost:3306/test' })

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

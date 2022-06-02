import { qb, SelectableSchema } from './fixtures/mysql'
import { createMockMySqlHelper, FakeDuplicateError } from '../test'
import { isDuplicatedError } from '../mysql'

describe('MockMySqlHelper', () => {
  test('Select', async() => {
    const fakeUser = {
      id: '1',
      name: 'kanziw',
      email: 'kanziwoong@gmail.com',
    } as SelectableSchema['user']

    const { db, mockMySqlCall, checkExecutedSqls } = createMockMySqlHelper()

    mockMySqlCall<SelectableSchema['user']>(
      'select * from `user` where `id` = ? limit ? offset ?',
      ['1', '1', '0'],
      [fakeUser],
    )

    const [user] = await db.query(qb
      .selectFrom('user')
      .selectAll()
      .where('id', '=', '1')
      .offset(0)
      .limit(1),
    )

    expect(user).toEqual(fakeUser)
    checkExecutedSqls()
  })

  test('Insert', async() => {
    const { db, mockMySqlCall, checkExecutedSqls } = createMockMySqlHelper()

    mockMySqlCall(
      'insert into `user` (`name`, `email`) values (?, ?)',
      ['kanziw', 'kanziwoong@gmail.com'],
      { insertId: 1 },
    )

    const { insertId } = await db.execute(qb
      .insertInto('user')
      .values({ name: 'kanziw', email: 'kanziwoong@gmail.com' }),
    )

    expect(insertId).toBe(1)
    checkExecutedSqls()
  })

  test('DuplicatedError', async() => {
    const { db, mockMySqlCall, checkExecutedSqls } = createMockMySqlHelper()

    mockMySqlCall(
      'insert into `user` (`name`, `email`) values (?, ?)',
      ['kanziw', 'kanziwoong@gmail.com'],
      new FakeDuplicateError(),
    )

    const promise = db.execute(qb
      .insertInto('user')
      .values({ name: 'kanziw', email: 'kanziwoong@gmail.com' }),
    )
    await expect(promise).rejects.toThrowError(FakeDuplicateError)
    await promise.catch(err => expect(isDuplicatedError(err)).toBe(true))

    checkExecutedSqls()
  })

  test('Update', async() => {
    const { db, mockMySqlCall, checkExecutedSqls } = createMockMySqlHelper()

    mockMySqlCall(
      'update `user` set `name` = ? where `id` = ?',
      ['kanziw', '9999'],
      { affectedRows: 1 },
    )

    const { affectedRows } = await db.execute(qb
      .updateTable('user')
      .set({ name: 'kanziw' })
      .where('id', '=', '9999'),
    )

    expect(affectedRows).toBe(1)
    checkExecutedSqls()
  })

  test('Delete', async() => {
    const { db, mockMySqlCall, checkExecutedSqls } = createMockMySqlHelper()

    mockMySqlCall(
      'delete from `user` where `id` = ?',
      ['9999'],
      { affectedRows: 1 },
    )

    const { affectedRows } = await db.execute(qb
      .deleteFrom('user')
      .where('id', '=', '9999'),
    )

    expect(affectedRows).toBe(1)
    checkExecutedSqls()
  })

  test('Raw SQL', async() => {
    const { db, mockMySqlCall, checkExecutedSqls } = createMockMySqlHelper()

    mockMySqlCall(
      'update `user` set `name` = ?, `created_at` = NOW(), `updated_at` = DATE_ADD(updated_at, INTERVAL 1 SECOND) where `id` = ?',
      ['kanziw', '9999'],
      { affectedRows: 1 },
    )

    const updatedAt = 'updated_at'

    const { affectedRows } = await db.execute(qb
      .updateTable('user')
      .set({
        name: 'kanziw',
        created_at: qb.sql`NOW()`,
        [updatedAt]: qb.raw(`DATE_ADD(${updatedAt}, INTERVAL 1 SECOND)`),
      })
      .where('id', '=', '9999'),
    )

    expect(affectedRows).toBe(1)
    checkExecutedSqls()
  })
})

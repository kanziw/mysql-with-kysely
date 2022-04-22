import { connect } from '../connection'

describe('Connection', () => {
  const { db, close } = connect()

  afterAll(() => close())

  test('ping', async () => {
    await db.ping()
  })
})

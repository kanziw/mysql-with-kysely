import { normalizeSql } from '../normalizeSql'

describe('normalizeSql', () => {
  test.each<[string, {
    sql: string,
    normalizedSql: string,
  }]>([
    ['w/ in, last', {
      sql: 'select * from `user` where `id` in (?, ?, ?, ?)',
      normalizedSql: 'select * from `user` where `id` in (?)',
    }],
    ['w/ in, not last', {
      sql: 'select * from `user` where `id` in (?, ?) and `name` = ?',
      normalizedSql: 'select * from `user` where `id` in (?) and `name` = ?',
    }],
    ['w/ in, not last 2', {
      sql: 'select `id` from `user` where `email` in (?, ?) and `name` = ? order by `email` desc limit ?',
      normalizedSql: 'select `id` from `user` where `email` in (?) and `name` = ? order by `email` desc limit ?',
    }],
    ['w/ single ?', {
      sql: 'select * from `user` where `id` = ?',
      normalizedSql: 'select * from `user` where `id` = ?',
    }],
    ['w/ multi single ?', {
      sql: 'update `user` set `name` = ?, `email` = ? where `id` = ?',
      normalizedSql: 'update `user` set `name` = ?, `email` = ? where `id` = ?',
    }],
    ['w/ values', {
      sql: 'insert into `user` (`name`, `email`) values (?, ?, ?)',
      normalizedSql: 'insert into `user` (`name`, `email`) values ()',
    }],
    ['w/ values include not ?', {
      sql: 'insert into `user` (`name`, `name`, `created_at`) values (?, ?, ?, NOW())',
      normalizedSql: 'insert into `user` (`name`, `name`, `created_at`) values ()',
    }],
    ['w/ values, multi insert', {
      sql: 'insert into `user` (`name`, `email`) values (?, ?), (?, ?)',
      normalizedSql: 'insert into `user` (`name`, `email`) values ()',
    }],
    ['w/ values, multi insert include not ?', {
      sql: 'insert into `user` (`name`, `email`, `created_at`) values (?, ?, NOW()), (?, ?, NOW())',
      normalizedSql: 'insert into `user` (`name`, `email`, `created_at`) values ()',
    }],
  ])('%s', async(_name, { sql, normalizedSql }) => {
    expect(normalizeSql(sql)).toEqual(normalizedSql)
  })
})

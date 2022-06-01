import type { Pool, PoolConnection, QueryError } from 'mysql2/promise'
import { cancellableDelay } from '@kanziw/time'
import { Subscriber, withSqlQueryMetricPublish } from './logging'
import { Query, queryWithSubscribers } from './query'

export interface MySql<Database> extends Query<Database> {
  ping(options?: { timeoutMs?:number }): Promise<void>;
  withTransaction<T = void>(fn: (connection: Query<Database>) => Promise<T>): Promise<T>;
  truncate(tableName: keyof Database): Promise<void>;
  subscribe(subscriber: Subscriber): void;
}

export const mysql = <Database>(pool: Pool): MySql<Database> => {
  const subscribers: Subscriber[] = []

  const withConnection = async <T>(
    fn: (connection: PoolConnection) => Promise<T>,
  ) => {
    const connection = await pool.getConnection()
    return fn(connection).finally(() => connection.release())
  }

  const query = queryWithSubscribers(subscribers)

  return {
    async ping({ timeoutMs = 3_000 } = {}) {
      const { promise, cancel } = cancellableDelay(timeoutMs)
      const isSuccess = await Promise.race([
        withConnection((connection) => connection.ping())
          .then(() => true)
          .catch(() => false)
          .finally(() => cancel()),
        promise.then(() => false),
      ])
      if (!isSuccess) {
        throw new Error('MySQL ping failed')
      }
    },

    async query(kyselyQb) {
      return withConnection((connection) => query(connection).query(kyselyQb))
    },

    async execute(kyselyQb) {
      return withConnection((connection) => query(connection).execute(kyselyQb))
    },

    async truncate(tableName) {
      return withConnection<void>(connection => {
        const sql = `truncate table ${tableName}`
        return withSqlQueryMetricPublish(sql, [], subscribers, async() => {
          await connection.execute(sql)
        })
      })
    },

    async withTransaction(fn) {
      return withConnection(async(connection) => {
        await connection.beginTransaction()
        try {
          const result = await fn(query(connection))
          await connection.commit()
          return result
        } catch (err: unknown) {
          await connection.rollback()
          throw err
        }
      })
    },

    subscribe(subscriber) {
      subscribers.push(subscriber)
    },
  }
}

export const isDuplicatedError = (err: unknown): boolean => {
  if (!(err instanceof Error)) {
    return false
  }
  return (err as QueryError).errno === 1062
}

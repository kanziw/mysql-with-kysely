import type { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise'
import type {
  DeleteQueryBuilder,
  DeleteResult,
  InsertQueryBuilder,
  InsertResult,
  Selectable,
  SelectQueryBuilder,
  UpdateQueryBuilder,
  UpdateResult,
} from 'kysely'
import { setTimeout as delay } from 'timers/promises'

type QueryType<Result, Database> = SelectQueryBuilder<Database, keyof Database, Result>;
type ExecuteType =
  InsertQueryBuilder<never, never, InsertResult>
  | UpdateQueryBuilder<never, never, never, UpdateResult>
  | DeleteQueryBuilder<never, never, DeleteResult>;

interface Query<Database> {
  query: <Result>(kyselyQb: QueryType<Result, Database>) => Promise<Array<Selectable<Result>>>;
  execute: (kyselyQb: ExecuteType) => Promise<ResultSetHeader>;
}

export interface MySql<Database> extends Query<Database> {
  ping: () => Promise<void>;
  withTransaction: <T = void>(fn: (connection: Query<Database>) => Promise<T>) => Promise<T>;
}

const query = <Database>(connection: PoolConnection): Query<Database> => {
  const _execute = async <T>(sql: string, parameters: readonly unknown[]) => {
    const [occurredAt, before] = [new Date(), performance.now()]

    try {
      const result = await connection.execute(sql, parameters)
      return (result ?? [])[0] as unknown as T
    } finally {
      const durationMs = performance.now() - before
      console.log(JSON.stringify({ sql, duration_ms: durationMs, occurred_at: occurredAt }))
    }
  }

  return {
    async query (kyselyQb) {
      const { sql, parameters } = kyselyQb.compile()
      if (!sql.startsWith('select')) {
        throw new Error('Only SELECT query is possible')
      }
      return _execute(sql, parameters)
    },
    async execute (kyselyQb) {
      const { sql, parameters } = kyselyQb.compile()
      if (sql.startsWith('select')) {
        throw new Error('SELECT query must use db.query')
      }
      return _execute<ResultSetHeader>(sql, parameters)
    },
  }
}

export const mysql = <Database>(pool: Pool): MySql<Database> => {
  const withConnection = async <T>(
    fn: (connection: PoolConnection) => Promise<T>,
  ) => {
    const connection = await pool.getConnection()
    return fn(connection).finally(() => connection.release())
  }
  return {
    ping: async () => {
      const isSuccess = await Promise.race([
        withConnection((connection) => connection.ping())
          .then(() => true)
          .catch(() => false),
        delay(3000).then(() => false),
      ])
      if (!isSuccess) {
        throw new Error('MySQL ping failed')
      }
    },
    async query (kyselyQb) {
      return withConnection((connection) => query(connection).query(kyselyQb))
    },
    async execute (kyselyQb) {
      return withConnection((connection) => query(connection).execute(kyselyQb))
    },
    async withTransaction (fn) {
      return withConnection(async (connection) => {
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
  }
}

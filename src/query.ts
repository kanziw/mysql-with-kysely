import { DeleteQueryBuilder, DeleteResult, InsertQueryBuilder, InsertResult, Selectable, SelectQueryBuilder, UpdateQueryBuilder, UpdateResult } from 'kysely'
import { PoolConnection, ResultSetHeader } from 'mysql2/promise'
import { Subscriber, withSqlQueryMetricPublish } from './logging'

type QueryType<Result, Database> = SelectQueryBuilder<Database, keyof Database, Result>;
type ExecuteType =
  InsertQueryBuilder<never, never, InsertResult>
  | UpdateQueryBuilder<never, never, never, UpdateResult>
  | DeleteQueryBuilder<never, never, DeleteResult>;

export interface Query<Database> {
  query<Result>(kyselyQb: QueryType<Result, Database>): Promise<Array<Selectable<Result>>>;
  execute(kyselyQb: ExecuteType): Promise<ResultSetHeader>;
}

export const queryWithSubscribers = (subscribers: Subscriber[]) => {
  return <Database>(connection: PoolConnection): Query<Database> => {
    const _execute = async <T>(sql: string, parameters: readonly unknown[]) => (
      withSqlQueryMetricPublish(sql, parameters, subscribers, async() => {
        const result = await connection.execute(sql, parameters)
        return (result ?? [])[0] as unknown as T
      })
    )

    return {
      async query(kyselyQb) {
        const { sql, parameters } = kyselyQb.compile()
        if (!sql.startsWith('select')) {
          throw new Error('Only SELECT query is possible')
        }
        return _execute(sql, parameters)
      },

      async execute(kyselyQb) {
        const { sql, parameters } = kyselyQb.compile()
        if (sql.startsWith('select')) {
          throw new Error('SELECT query must use db.query')
        }
        return _execute<ResultSetHeader>(sql, parameters)
      },
    }
  }
}

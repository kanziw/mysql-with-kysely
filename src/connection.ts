import { createPool } from 'mysql2/promise'
import { mysql } from './mysql'

export const connect = <Database>({ uri }: { uri: string }) => {
  const mysqlPool = createPool({
    uri,
    supportBigNumbers: true,
    bigNumberStrings: true,
    charset: 'utf8mb4',
  })

  return {
    db: mysql<Database>(mysqlPool),
    close: () => mysqlPool.end(),
  }
}

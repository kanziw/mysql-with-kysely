import { createPool } from 'mysql2/promise'
import { mysql } from './mysql'

export const connect = async <Database>() => {
  const mysqlPool = createPool({
    uri: 'mysql://root:root@localhost:3306/test',
    supportBigNumbers: true,
    bigNumberStrings: true,
    charset: 'utf8mb4',
  })

  return {
    db: mysql<Database>(mysqlPool),
    end: () => mysqlPool.end(),
  }
}
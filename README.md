# mysql-with-kysely

![CI](https://github.com/kanziw/mysql-with-kysely/actions/workflows/ci.yml/badge.svg) [![codecov](https://codecov.io/gh/kanziw/mysql-with-kysely/branch/main/graph/badge.svg?token=DYH0PQHQ9R)](https://codecov.io/gh/kanziw/mysql-with-kysely)

- `mysql-with-kysely` use [mysql2](https://github.com/sidorares/node-mysql2) and [kysely](https://github.com/koskimas/kysely)
- Handle MySQL BIGINT type as string
- `Incorrect arguments to mysqld_stmt_execute` error safe!
  - Since MySQL 8.0.22, mysql2 driver has `Incorrect arguments to mysqld_stmt_execute` [issue](https://github.com/sidorares/node-mysql2/issues/1239)
  - [OffsetLimitTypeCastingPlugin](./src/kyselyPlugins/offsetLimitTypeCastingPlugin.ts) resolves it


## Installation

```zsh
$ yarn add mysql-with-kysely
```


## Usages

```ts
import { toInsertableSchema, toFullSelectableSchema, WithSchema, connect, queryBuilder } from 'mysql-with-kysely'
import type { User } from './model'

// for query builder
type Database = {
  user: WithSchema<User>
}

// for your code
type SelectableSchema = toFullSelectableSchema<Database>
type InsertableSchema = toInsertableSchema<Database>

const { db, close } = connect<Database>({ uri: 'mysql://root:root@localhost:3306/test' });

// collect your metrics
db.subscribe(({ sql, normalizedSql, durationMs, occurredAt, parameters }) => {
})

// your query builder
const qb = queryBuilder<Database>()

// write your codes type safely
// type of users is `Array<SelectableSchema['user']>`
// if you don't need created_at & updated_at, use toSelectableSchema instead of toFullSelectableSchema
const users = await db.query(qb
  .selectFrom('user')
  .selectAll()
  .orderBy('id', 'desc')
  .limit(1),
)

// type of value is `InsertableSchema['user']`
const value = { name: 'kanziw', email: 'kanziwoong@gmail.com' }     
const { insertId } = await db.execute(qb
  .insertInto('user')
  .values(value),
)

// close MySQL connection
await close()
```


### Database type

1. `WithPkId`: for auto increment `id` column
2. `WithDataLifecycleTracker`
    1. `created_at`: for `DATETIME DEFAULT CURRENT_TIMESTAMP`
    2. `updated_at`: for `DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
3. `WithSchema`: `WithPkId` & `WithDataLifecycleTracker`


## Recommended Usages Personally

1. Write DDL
    1.  See [ddl.sql](./ddl.sql)
2. Prepare types
    1. Apply DDL to MySQL Server using [mysqldef](https://github.com/k0kubun/sqldef)
    2. Generate model using [sql-ts](https://github.com/rmp135/sql-ts)
    3. See `db:sync` script in [package.json](./package.json)
3. Set up your own query builder
    1. See [mysql.ts](./src/__tests__/fixtures/mysql.ts)
4. Write your own code!
    1. See [integration.spec.ts](./src/__tests__/integration.spec.ts)
5. Write your test code using [createMockMySqlHelper](./src/test/mockMySql.ts)
    1. See [mockMySql.spec.ts](./src/__tests__/mockMySql.spec.ts)
6. Subscribe MySQL Metrics
    1. See [subscribe.spec.ts](./src/__tests__/subscribe.spec.ts)

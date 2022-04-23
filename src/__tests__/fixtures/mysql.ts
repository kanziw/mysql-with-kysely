import { queryBuilder, WithSchema, SelectableSchema } from '../../index'
import type { User } from './model'

export type Database = {
  user: WithSchema<User>
}
export type Schema = SelectableSchema<Database>

export const qb = queryBuilder<Database>()

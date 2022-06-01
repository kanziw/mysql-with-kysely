import { queryBuilder, WithSchema, toSelectableSchema } from '../../index'
import type { User } from './model'

export type Database = {
  user: WithSchema<User>
}
export type SelectableSchema = toSelectableSchema<Database>

export const qb = queryBuilder<Database>()

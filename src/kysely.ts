import { ColumnType, Generated, Kysely, MysqlDialect, Selectable } from 'kysely'
import { LimitCasingPlugin } from './kyselyPlugins'

export type WithPkId<Schema> = { id: Generated<string> } & Omit<Schema, 'id'>

type DataLifecycleType = ColumnType<Date, Date | undefined, Date | undefined>;
type DataLifecycleTracker = {
  created_at: DataLifecycleType,
  updated_at: DataLifecycleType,
};
export type WithDataLifecycleTracker<Schema> = DataLifecycleTracker & Omit<Schema, 'created_at' | 'updated_at'>

export type WithSchema<Schema> = WithPkId<WithDataLifecycleTracker<Schema>>;
export type SelectableSchema<Database> = {
  [key in keyof Database]: Selectable<Database[key]>
}

export const queryBuilder = <Database>() => new Kysely<Database>({
  dialect: new MysqlDialect({}),
  plugins: [new LimitCasingPlugin()],
})

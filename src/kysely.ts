import { ColumnType, Generated, Insertable, Kysely, MysqlDialect, Selectable, sql } from 'kysely'
import { OffsetLimitTypeCastingPlugin } from './kyselyPlugins'

export type WithPkId<Schema> = { id: Generated<string> } & Omit<Schema, 'id'>

type DataLifecycleType = ColumnType<Date, Date | undefined, Date | undefined>;
type DataLifecycleTracker = {
  created_at: DataLifecycleType,
  updated_at: DataLifecycleType,
};
export type WithDataLifecycleTracker<Schema> = DataLifecycleTracker & Omit<Schema, 'created_at' | 'updated_at'>

export type WithSchema<Schema> = WithPkId<WithDataLifecycleTracker<Schema>>;
export type SelectableSchema<Database> = {
  [key in keyof Database]: Omit<Selectable<Database[key]>, 'created_at' | 'updated_at'>
}
export type FullSelectableSchema<Database> = {
  [key in keyof Database]: Selectable<Database[key]>
}
export type InsertableSchema<Database> = {
  [key in keyof Database]: Insertable<Database[key]>
}

export class MySqlWithKysely<Database> extends Kysely<Database> {
  public raw<T>(rawSql: string) {
    return sql<T>(rawSql as unknown as TemplateStringsArray)
  }

  public sql<T>(rawSql: TemplateStringsArray, ...parameters: unknown[]) {
    return sql<T>(rawSql, ...parameters)
  }
}

export const queryBuilder = <Database>() => new MySqlWithKysely<Database>({
  dialect: new MysqlDialect({}),
  plugins: [new OffsetLimitTypeCastingPlugin()],
})

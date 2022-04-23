import { QueryResult, ColumnType, Generated, Kysely, KyselyPlugin, MysqlDialect, OperationNodeTransformer, PluginTransformQueryArgs, PluginTransformResultArgs, RootOperationNode, SelectQueryNode, UnknownRow, LimitNode, Selectable } from 'kysely'

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

const isValidNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value)

class LimitCasingTransformer extends OperationNodeTransformer {
  protected override transformSelectQuery(
    node: SelectQueryNode,
  ): SelectQueryNode {
    return isValidNumber(node.limit?.limit.value)
      ? SelectQueryNode.cloneWithLimit(node, LimitNode.create(`${node.limit?.limit.value}` as unknown as number))
      : super.transformSelectQuery(node)
  }
}

class LimitCasingPlugin implements KyselyPlugin {
  readonly #transformer: LimitCasingTransformer

  constructor() {
    this.#transformer = new LimitCasingTransformer()
  }

  transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
    return this.#transformer.transformNode(args.node)
  }

  async transformResult(
    args: PluginTransformResultArgs,
  ): Promise<QueryResult<UnknownRow>> {
    return args.result
  }
}

export const queryBuilder = <Database>() => new Kysely<Database>({
  dialect: new MysqlDialect({}),
  plugins: [new LimitCasingPlugin()],
})

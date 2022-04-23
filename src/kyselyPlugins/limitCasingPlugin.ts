import { KyselyPlugin, LimitNode, OperationNodeTransformer, PluginTransformQueryArgs, PluginTransformResultArgs, QueryResult, RootOperationNode, SelectQueryNode, UnknownRow } from 'kysely'

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

export class LimitCasingPlugin implements KyselyPlugin {
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

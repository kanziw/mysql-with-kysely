import { KyselyPlugin, LimitNode, OffsetNode, OperationNodeTransformer, PluginTransformQueryArgs, PluginTransformResultArgs, QueryResult, RootOperationNode, SelectQueryNode, UnknownRow } from 'kysely'

const isValidNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value)

class OffsetLimitTypeCastingTransformer extends OperationNodeTransformer {
  protected override transformSelectQuery(
    node: SelectQueryNode,
  ): SelectQueryNode {
    if (isValidNumber(node.limit?.limit.value)) {
      node = SelectQueryNode.cloneWithLimit(node, LimitNode.create(`${node.limit?.limit.value}` as unknown as number))
    }
    if (isValidNumber(node.offset?.offset.value)) {
      node = SelectQueryNode.cloneWithOffset(node, OffsetNode.create(`${node.offset?.offset.value}` as unknown as number))
    }

    return super.transformSelectQuery(node)
  }
}

export class OffsetLimitTypeCastingPlugin implements KyselyPlugin {
  readonly #transformer: OffsetLimitTypeCastingTransformer

  constructor() {
    this.#transformer = new OffsetLimitTypeCastingTransformer()
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

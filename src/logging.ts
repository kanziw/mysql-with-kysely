import { startStopwatch } from '@kanziw/time'
import { normalizeSql } from './normalizeSql'

export type SqlQueryMetric = {
  sql: string,
  parameters: readonly unknown[],
  normalizedSql: string,
  durationMs: number,
  occurredAt: Date,
}

export type Subscriber = (sqlQueryMetric: SqlQueryMetric) => void;

export const withSqlQueryMetricPublish = async<T>(
  sql: string,
  parameters: readonly unknown[],
  subscribers: Subscriber[],
  fn: () => Promise<T>,
) => {
  const [occurredAt, stopwatch] = [new Date(), startStopwatch()]

  try {
    const resp = await fn()
    return resp
  } finally {
    subscribers.forEach(subscriber => {
      subscriber({ sql, parameters, normalizedSql: normalizeSql(sql), durationMs: stopwatch.end(), occurredAt })
    })
  }
}

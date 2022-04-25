export const normalizeSql = (sql: string): string => {
  if (sql.startsWith('insert')) {
    const splited = sql.split(' values ')
    if (splited[1]) {
      splited[1] = '()'
    }
    sql = splited.join(' values ')
  }
  return sql
    .replace(/(, \?)+/g, '')
    .replace(/(NOW\(\)\), \(\?)+/g, '')
    .replace(/(\), \(\?)+/g, '')
}

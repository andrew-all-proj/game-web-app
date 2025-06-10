export const getMaxVersion = <T extends { version?: number }>(items: T[] | undefined): T | null => {
  if (!items || items.length === 0) return null

  if (items.length === 1) return items[0]

  const filtered = items.filter((item) => typeof item.version === 'number')

  if (filtered.length === 0) return null

  return filtered.reduce((max, item) => ((item.version ?? 0) > (max.version ?? 0) ? item : max))
}

export function getDaysAgo(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

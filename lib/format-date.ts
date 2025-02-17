// Format an epoch timestamp into a string
export default function formatDate(ts: number): string {
  const date = new Date(ts * 1000)
  return date.toLocaleString('default', { month: 'short', day: '2-digit' })
}

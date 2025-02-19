// Format an epoch timestamp into a string
export default function formatDate(ts: number): string {
  const date = new Date(ts * 1000)
  return date.toLocaleString('default', { month: 'short', day: '2-digit' })
}

// Format an epoch timestamp into YYYYMMDD format
export function formatDateYYYYMMDD(ts: number): string {
  const date = new Date(ts * 1000)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

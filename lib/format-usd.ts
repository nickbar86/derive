// Format $USD into a string
export default function formatUSD(usd: number, numDps = 2): string {
  return isNaN(usd) ? '?' : `$${usd.toFixed(numDps)}`
}

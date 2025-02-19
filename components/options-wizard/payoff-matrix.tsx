import { useOptionsWizard } from './context'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useMemo } from 'react'
import formatUSD from '@/lib/format-usd'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface DataPoint {
  price: number
  payoff: number
  iv_bid: number
  iv_ask: number
}

const chartConfig = {
  payoff: {
    label: "Payoff",
    color: "blue",
  },
  iv_bid: {
    label: "IV (Bid)",
    color: "green",
  },
  iv_ask: {
    label: "IV (Ask)",
    color: "red", 
  },
} as const

export function PayoffMatrix() {
  const { 
    selectedCurrency,
    spotPrice,
    selectedExpiry,
    selectedStrike,
    instruments,
    ticker
  } = useOptionsWizard()

  const data = useMemo(() => {
    if (!spotPrice || !selectedStrike || !selectedExpiry || !ticker?.option_pricing) return []

    const strike = Number(selectedStrike)
    const isCall = strike > spotPrice
    const pricing = ticker.option_pricing
  
    const priceRange = spotPrice * 0.5
    const points: DataPoint[] = Array.from({ length: 50 }, (_, i) => {
      const price = spotPrice - priceRange + (i * (2 * priceRange / 49))
      return {
        price,
        payoff: isCall 
          ? Math.max(0, price - strike) 
          : Math.max(0, strike - price),
        iv_bid: Number(pricing.bid_iv) / 100,
        iv_ask: Number(pricing.ask_iv) / 100
      }
    })

    return points
  }, [spotPrice, selectedStrike, selectedExpiry, ticker])

  if (!selectedCurrency || !spotPrice || !selectedStrike || !selectedExpiry) {
    return (
      <Card className="min-h-[450px]">
        <CardHeader>
          <CardTitle>Payoff & IV Analysis</CardTitle>
          <CardDescription>Select currency, strike, and expiry to see analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const isCall = Number(selectedStrike) > spotPrice
  const pricing = ticker?.option_pricing

  return (
    <Card className="min-h-[450px]">
      <CardHeader>
        <CardTitle>Payoff & IV Analysis</CardTitle>
        <CardDescription>
          {isCall 
            ? `Call option payoff at different prices`
            : `Put option payoff at different prices`}
          {pricing && (
            <div className="mt-1 text-sm">
              <div>IV: {pricing.bid_iv}% (bid) - {pricing.ask_iv}% (ask)</div>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={data} 
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="price" 
                tickFormatter={(value: number) => formatUSD(value)}
                label={{ value: 'Price at Expiry', position: 'bottom' }}
                tickCount={3}
              />
              <YAxis 
                yAxisId="left"
                tickFormatter={(value: number) => {
                  const formatted = formatUSD(value)
                  return formatted.replace('.00', '')
                }}
                domain={[0, 'auto']}
                width={60}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tickFormatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                domain={[0, Math.max(Number(pricing?.ask_iv || 0), Number(pricing?.bid_iv || 0)) / 100 * 1.1]}
                width={60}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'payoff') return formatUSD(value)
                  if (name.startsWith('iv')) return `${(value * 100).toFixed(2)}%`
                  return value
                }}
                labelFormatter={(label: string) => `Price: ${formatUSD(Number(label))}`}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="payoff" 
                stroke={chartConfig.payoff.color}
                strokeWidth={2}
                name={chartConfig.payoff.label}
                dot={false}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="iv_ask" 
                stroke={chartConfig.iv_ask.color}
                strokeWidth={2}
                name={chartConfig.iv_ask.label}
                dot={false}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="iv_bid" 
                stroke={chartConfig.iv_bid.color}
                strokeWidth={2}
                name={chartConfig.iv_bid.label}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 
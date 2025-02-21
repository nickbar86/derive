import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer,Tooltip, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import formatUSD from '@/lib/format-usd'

import { useOptionsWizard } from './context'

interface DataPoint {
  price: number
  payoff: number
}

const CHART_COLOR = "blue"

export function PayoffMatrix() {
  const { 
    spotPrice,
    selectedExpiry,
    selectedStrike,
    ticker
  } = useOptionsWizard()

  const data = useMemo<{ points: DataPoint[]; isCall: boolean } | { points: []; isCall: false }>(() => {
    if (!spotPrice || !selectedStrike || !selectedExpiry || !ticker?.option_pricing) {
      return { points: [], isCall: false }
    }

    const strike = Number(selectedStrike)
    const isCall = strike > spotPrice
  
    const priceRange = spotPrice * 0.5
    const numPoints = 50
    const numIntervals = numPoints - 1
    const minPrice = spotPrice - priceRange
    const maxPrice = spotPrice + priceRange
    const totalRange = maxPrice - minPrice
    const priceStep = totalRange / numIntervals
    
    const points: DataPoint[] = Array.from({ length: numPoints }, (_, i) => {
      const price = minPrice + (i * priceStep)
      return {
        price,
        payoff: isCall 
          ? Math.max(0, price - strike) 
          : Math.max(0, strike - price),
      }
    })

    return { points, isCall }
  }, [spotPrice, selectedStrike, selectedExpiry, ticker])

  if (!data.points?.length) {
    return (
      <Card className="min-h-[450px]">
        <CardHeader>
          <CardTitle>Option Payoff</CardTitle>
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

  const pricing = ticker?.option_pricing

  return (
    <Card className="min-h-[450px]">
      <CardHeader>
        <CardTitle>Option Payoff</CardTitle>
        <CardDescription>
          {data.isCall 
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
              data={data.points} 
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
              <Tooltip 
                formatter={(value: number) => formatUSD(value)}
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
                stroke={CHART_COLOR}
                strokeWidth={2}
                name="Payoff"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 
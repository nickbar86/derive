import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { CurrencyResponseSchema } from '@/types/public.get_all_currencies'

type Props = {
  currencies: CurrencyResponseSchema[]
  selectedCurrency: string
  onCurrencyChange: (value: string) => void
}

export function OptionsWizardCard({ currencies, selectedCurrency, onCurrencyChange }: Props) {
  const selectedCurrencyData = currencies.find(c => c.currency === selectedCurrency)
  const priceChange = selectedCurrencyData
    ? Number(selectedCurrencyData.spot_price) - Number(selectedCurrencyData.spot_price_24h)
    : 0
  const priceChangePercent =
    selectedCurrencyData
      ? ((priceChange / Number(selectedCurrencyData.spot_price_24h)) * 100).toFixed(2)
      : '0'

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Options Wizard</CardTitle>
        <CardDescription>Pick a currency, target strike price, and timeframe to find the right option.</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <label>Currency</label>
          <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currency => (
                <SelectItem key={currency.currency} value={currency.currency}>
                  <div className="flex justify-between w-full">
                    <div className="flex gap-2">
                      <span>{currency.currency}</span>
                      <span>${Number(currency.spot_price).toLocaleString()}</span>
                    </div>
                    <span>
                      {Number(currency.spot_price) > Number(currency.spot_price_24h) ? '↑' : '↓'} 
                      {priceChangePercent}%
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCurrencyData && (
            <p className="text-sm text-muted-foreground mt-1">
              24h change: ${priceChange.toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 
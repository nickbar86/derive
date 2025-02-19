import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { SupportedCurrency } from '@/types/currencies'
import formatUSD from '@/lib/format-usd'
import { useOptionsWizard } from './context'
import { Skeleton } from '../ui/skeleton'

export function CurrencySelector() {
  const { currencies, selectedCurrency, setSelectedCurrency, spotPrice, isLoadingCurrencies } = useOptionsWizard()
  const selectedCurrencyData = currencies.find(c => c.currency === selectedCurrency)
  const priceChange = selectedCurrencyData
    ? Number(selectedCurrencyData.spot_price) - Number(selectedCurrencyData.spot_price_24h)
    : 0
  const priceChangePercent =
    selectedCurrencyData
      ? ((priceChange / Number(selectedCurrencyData.spot_price_24h)) * 100).toFixed(2)
      : '0'

  if (isLoadingCurrencies) {
    return (
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <label className="font-medium">1. Select your currency</label>
          <Skeleton className="h-4 w-24" data-testid="loading-skeleton" />
        </div>
        <Skeleton className="h-10 w-full" data-testid="loading-skeleton" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="font-medium">1. Select your currency</label>
        {selectedCurrencyData && (
          <p data-testid="price-change" className="text-sm text-muted-foreground">
            24h change: {formatUSD(priceChange)}
          </p>
        )}
      </div>
      <Select 
        value={selectedCurrency} 
        onValueChange={(value: SupportedCurrency) => setSelectedCurrency(value)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent 
          position="popper" 
          side="bottom" 
          align="start"
          className="max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)]"
        >
          {currencies.map(currency => {
            const currencyPriceChange = Number(currency.spot_price) - Number(currency.spot_price_24h)
            const currencyPercentageChange = ((currencyPriceChange / Number(currency.spot_price_24h)) * 100).toFixed(2)
            
            return (
              <SelectItem key={currency.currency} value={currency.currency}>
                <div className="flex justify-between w-full">
                  <div className="flex gap-2">
                    <span>{currency.currency}</span>
                    <span>{formatUSD(Number(currency.spot_price))}</span>
                  </div>
                  <span data-testid={`price-change-${currency.currency}`}>
                    {Number(currency.spot_price) > Number(currency.spot_price_24h) ? '↑' : '↓'} 
                    {currencyPercentageChange}%
                  </span>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
} 
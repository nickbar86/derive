import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Skeleton } from '../ui/skeleton'
import formatUSD from '@/lib/format-usd'
import { useCurrencies, useInstruments } from '@/hooks'

export function StrikeSelector() {
  const { currencies, selectedCurrency } = useCurrencies()
  const selectedCurrencyData = currencies.find(c => c.currency === selectedCurrency)
  const spotPrice = selectedCurrencyData ? Number(selectedCurrencyData.spot_price) : 0

  const { instruments, isLoading: isLoadingInstruments, selectedExpiry, selectedStrike, setSelectedStrike } = useInstruments(selectedCurrency, spotPrice)

  return (
    <div>
      <div className="flex flex-col gap-1 mb-1.5">
        <label className="font-medium">2. Choose your target price</label>
        <p className="text-sm text-muted-foreground">
          {spotPrice ? `Current price: ${formatUSD(spotPrice)}` : 'Select a currency first'}
        </p>
      </div>
      {isLoadingInstruments ? (
        <Skeleton className="h-10 w-full rounded-md" />
      ) : (
        <Select value={selectedStrike} onValueChange={(value: string) => setSelectedStrike(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select strike price" />
          </SelectTrigger>
          <SelectContent 
            position="popper" 
            side="bottom" 
            align="start"
            className="max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)]"
          >
            {instruments.strikesByExpiry[selectedExpiry]?.map((strike: string) => (
              <SelectItem key={strike} value={strike}>
                {formatUSD(Number(strike))}
              </SelectItem>
            )) || []}
          </SelectContent>
        </Select>
      )}
    </div>
  )
} 
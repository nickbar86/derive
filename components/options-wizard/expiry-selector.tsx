import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Skeleton } from '../ui/skeleton'
import formatDate from '@/lib/format-date'
import { useCurrencies, useInstruments } from '@/hooks'

export function ExpirySelector() {
  const { currencies, selectedCurrency } = useCurrencies()
  const selectedCurrencyData = currencies.find(c => c.currency === selectedCurrency)
  const spotPrice = selectedCurrencyData ? Number(selectedCurrencyData.spot_price) : 0

  const { 
    instruments, 
    isLoading: isLoadingInstruments, 
    selectedExpiry, 
    setSelectedExpiry,
    selectedStrike,
    setSelectedStrike
  } = useInstruments(selectedCurrency, spotPrice)

  // Handle expiry change and auto-select closest strike to spot price
  const handleExpiryChange = (expiry: string) => {
    setSelectedExpiry(expiry)
    
    const strikes = instruments.strikesByExpiry[expiry]?.map(Number) || []
    if (strikes.length && spotPrice) {
      // Find the strike closest to current spot price
      const closestStrike = strikes.reduce((prev: number, curr: number) => 
        Math.abs(curr - spotPrice) < Math.abs(prev - spotPrice) ? curr : prev
      )
      setSelectedStrike(closestStrike.toString())
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-1 mb-1.5">
        <label className="font-medium">3. Pick your timeframe</label>
        <p className="text-sm text-muted-foreground">When do you expect to reach your target?</p>
      </div>
      {isLoadingInstruments ? (
        <Skeleton className="h-10 w-full rounded-md" />
      ) : (
        <Select value={selectedExpiry} onValueChange={handleExpiryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select expiry date" />
          </SelectTrigger>
          <SelectContent 
            position="popper" 
            side="bottom" 
            align="start"
            className="max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)]"
          >
            {instruments.expiryDates.map((expiry: number) => (
              <SelectItem key={expiry} value={expiry.toString()}>
                {formatDate(expiry)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
} 
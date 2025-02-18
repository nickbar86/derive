import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Skeleton } from '../ui/skeleton'
import formatUSD from '@/lib/format-usd'
import { useOptionsWizard } from './context'

export function StrikeSelector() {
  const { 
    selectedCurrency,
    spotPrice,
    instruments,
    isLoading: isLoadingInstruments,
    selectedExpiry,
    selectedStrike,
    setSelectedStrike
  } = useOptionsWizard()

  const availableStrikes = selectedExpiry ? instruments.strikesByExpiry[selectedExpiry] || [] : []
  const isDisabled = !selectedCurrency || !selectedExpiry || availableStrikes.length === 0

  return (
    <div>
      <div className="flex flex-col gap-1 mb-1.5">
        <label className="font-medium">2. Choose your target price</label>
        <p className="text-sm text-muted-foreground">
          {!selectedCurrency 
            ? 'Select a currency first'
            : !selectedExpiry
            ? 'Select an expiry date first'
            : `Current price: ${formatUSD(spotPrice)}`}
        </p>
      </div>
      {isLoadingInstruments ? (
        <Skeleton className="h-10 w-full rounded-md" />
      ) : (
        <Select 
          value={selectedStrike} 
          onValueChange={(value: string) => setSelectedStrike(value)}
          disabled={isDisabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !selectedCurrency 
                ? "Select currency first" 
                : !selectedExpiry 
                ? "Select expiry first"
                : "Select strike price"
            } />
          </SelectTrigger>
          <SelectContent 
            position="popper" 
            side="bottom" 
            align="start"
            className="max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)]"
          >
            {availableStrikes.map((strike: string) => (
              <SelectItem key={strike} value={strike}>
                {formatUSD(Number(strike))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
} 
import { Skeleton } from '../ui/skeleton'
import formatUSD from '@/lib/format-usd'
import { useTicker } from '@/hooks'
import { useOptionsWizard } from './context'

export function RecommendedOption() {
  const { 
    selectedCurrency,
    spotPrice,
    instruments,
    isLoading: isLoadingInstruments,
    selectedExpiry,
    selectedStrike
  } = useOptionsWizard()

  const { ticker, isLoading: isLoadingTicker } = useTicker(
    selectedCurrency,
    selectedExpiry,
    selectedStrike,
    spotPrice,
    instruments
  )

  // Get recommended instrument based on strike vs spot price
  const getInstrumentName = (currency: string, expiry: string, strike: string, isCall: boolean) => {
    // Convert expiry from unix timestamp to YYYYMMDD format
    const date = new Date(Number(expiry) * 1000)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const formattedExpiry = `${year}${month}${day}`
    
    // Format strike price without decimals
    const formattedStrike = String(Number(strike))
    
    return `${currency}-${formattedExpiry}-${formattedStrike}-${isCall ? 'C' : 'P'}`
  }

  const recommendedInstrumentName = selectedStrike && spotPrice
    ? getInstrumentName(
        selectedCurrency,
        selectedExpiry,
        selectedStrike,
        Number(selectedStrike) > spotPrice
      )
    : null
  
  const recommendedInstrument = recommendedInstrumentName ? instruments.byName[recommendedInstrumentName] : null

  if (!isLoadingInstruments && !isLoadingTicker && !recommendedInstrument) {
    return null
  }

  return (
    <div className="mt-2 p-4 bg-muted rounded-lg">
      <h3 className="font-medium mb-2">Recommended Option</h3>
      <div className="flex flex-col gap-2">
        {(isLoadingInstruments || isLoadingTicker) ? (
          <>
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="p-2 bg-background rounded space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="p-2 bg-background rounded space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </>
        ) : recommendedInstrument && (
          <>
            <p>
              {recommendedInstrument.instrument_name}
              <span className="ml-2 text-sm text-muted-foreground">
                ({Number(selectedStrike) > spotPrice ? 'Call' : 'Put'} option)
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              {Number(selectedStrike) > spotPrice 
                ? `Buy if you expect ${selectedCurrency} to rise above ${formatUSD(Number(selectedStrike))}`
                : `Buy if you expect ${selectedCurrency} to fall below ${formatUSD(Number(selectedStrike))}`
              }
            </p>
            {ticker && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-background rounded">
                  <span className="text-muted-foreground">Best Bid:</span>
                  <span className="ml-2">{formatUSD(Number(ticker.best_bid_price))}</span>
                </div>
                <div className="p-2 bg-background rounded">
                  <span className="text-muted-foreground">Best Ask:</span>
                  <span className="ml-2">{formatUSD(Number(ticker.best_ask_price))}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 
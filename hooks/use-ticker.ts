import { useState, useEffect } from 'react'
import { PublicGetTickerResultSchema } from '@/types/public.get_ticker'
import { SupportedCurrency } from '@/types/currencies'
import fetchTicker from '@/lib/api/get-ticker'
import { InstrumentsMap } from './use-instruments'

export function useTicker(
  selectedCurrency: SupportedCurrency,
  selectedExpiry: string,
  selectedStrike: string,
  spotPrice: number,
  instruments: InstrumentsMap
) {
  const [ticker, setTicker] = useState<PublicGetTickerResultSchema | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!selectedCurrency || !selectedExpiry || !selectedStrike) {
      setTicker(undefined)
      return
    }

    const strikePrice = Number(selectedStrike)
    const isCall = strikePrice > spotPrice

    // Convert expiry from unix timestamp to YYYYMMDD format
    const date = new Date(Number(selectedExpiry) * 1000)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const formattedExpiry = `${year}${month}${day}`
    
    // Format strike price without decimals
    const formattedStrike = String(strikePrice)
    
    // Construct the instrument name with the correct format
    const instrumentName = `${selectedCurrency}-${formattedExpiry}-${formattedStrike}-${isCall ? 'C' : 'P'}`
    const instrument = instruments.byName[instrumentName]
    
    if (!instrument) {
      setTicker(undefined)
      return
    }

    let isCanceled = false
    setIsLoading(true)

    fetchTicker({ instrument_name: instrument.instrument_name })
      .then(({ result }) => {
        if (isCanceled) return
        setTicker(result)
      })
      .catch(() => {
        if (isCanceled) return
        setTicker(undefined)
      })
      .finally(() => {
        if (isCanceled) return
        setIsLoading(false)
      })

    return () => {
      isCanceled = true
    }
  }, [selectedCurrency, selectedExpiry, selectedStrike, spotPrice, instruments])

  return {
    ticker,
    isLoading
  }
} 
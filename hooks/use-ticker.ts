import { useEffect,useState } from 'react'

import fetchTicker from '@/lib/api/get-ticker'
import { formatDateYYYYMMDD } from '@/lib/format-date'
import { SupportedCurrency } from '@/types/currencies'
import { PublicGetTickerResultSchema } from '@/types/public.get_ticker'

import { InstrumentsMap } from './use-instruments'

const fetchTickerData = async (
  instrumentName: string,
  onSuccess: (data: PublicGetTickerResultSchema) => void,
  onError: () => void,
  isCanceled: () => boolean
) => {
  try {
    const { result } = await fetchTicker({ instrument_name: instrumentName })
    if (!isCanceled()) {
      onSuccess(result)
    }
  } catch (error) {
    if (!isCanceled()) {
      onError()
    }
  }
}

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

    const formattedExpiry = formatDateYYYYMMDD(Number(selectedExpiry))
    const formattedStrike = String(strikePrice)
    
    const instrumentName = `${selectedCurrency}-${formattedExpiry}-${formattedStrike}-${isCall ? 'C' : 'P'}`
    const instrument = instruments.byName[instrumentName]
    
    if (!instrument) {
      setTicker(undefined)
      return
    }

    let isCanceled = false
    setIsLoading(true)

    const handleSuccess = (result: PublicGetTickerResultSchema) => {
      setTicker(result)
      setIsLoading(false)
    }

    const handleError = () => {
      setTicker(undefined)
      setIsLoading(false)
    }

    fetchTickerData(
      instrument.instrument_name,
      handleSuccess,
      handleError,
      () => isCanceled
    )

    return () => {
      isCanceled = true
    }
  }, [selectedCurrency, selectedExpiry, selectedStrike, spotPrice, instruments])

  return {
    ticker,
    isLoading
  }
} 
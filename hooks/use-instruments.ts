import { sortedIndex } from 'lodash'
import { useEffect, useState } from 'react'

import fetchInstruments from '@/lib/api/fetch-instruments'
import { SupportedCurrency } from '@/types/currencies'
import { InstrumentPublicResponseSchema } from '@/types/public.get_instruments'

export type InstrumentsMap = {
  byName: Record<string, InstrumentPublicResponseSchema>
  expiryDates: number[]
  strikesByExpiry: Record<string, string[]>
}

export const findNearestExpiryAndStrike = (
  sortedExpiryDates: number[],
  strikesByExpiry: Record<string, string[]>,
  spotPrice: number
): { expiry: string; strike: string } => {
  if (!sortedExpiryDates.length) return { expiry: '', strike: '' }

  const currentTimestamp = Math.floor(Date.now() / 1000)
  
  const nearestIndex = sortedIndex(sortedExpiryDates, currentTimestamp)
  const nearestExpiry = nearestIndex < sortedExpiryDates.length 
    ? sortedExpiryDates[nearestIndex].toString() 
    : sortedExpiryDates[0]?.toString() || ''

  if (!nearestExpiry) return { expiry: '', strike: '' }
  if (!strikesByExpiry[nearestExpiry]) return { expiry: nearestExpiry, strike: '' }

  const strikes = strikesByExpiry[nearestExpiry].map(Number)
  if (!strikes.length) return { expiry: nearestExpiry, strike: '' }

  // Find closest strike to spot price
  const closestIndex = sortedIndex(strikes, spotPrice)
  // Handle edge cases (beginning/end of array)
  const prevStrike = strikes[closestIndex - 1]
  const nextStrike = strikes[closestIndex]
  const closestStrike = !nextStrike ? prevStrike 
    : !prevStrike ? nextStrike
    : Math.abs(prevStrike - spotPrice) < Math.abs(nextStrike - spotPrice)
      ? prevStrike 
      : nextStrike

  return { expiry: nearestExpiry, strike: closestStrike?.toString() || '' }
}

export const findClosestStrike = (strikes: string[], spotPrice: number): string => {
  if (!strikes.length) return ''
  
  const strikePrices = strikes.map(Number)
  const closestIndex = sortedIndex(strikePrices, spotPrice)
  const prevStrike = strikePrices[closestIndex - 1]
  const nextStrike = strikePrices[closestIndex]
  
  const closestStrike = !nextStrike ? prevStrike 
    : !prevStrike ? nextStrike
    : Math.abs(prevStrike - spotPrice) < Math.abs(nextStrike - spotPrice)
      ? prevStrike 
      : nextStrike

  return closestStrike?.toString() || ''
}

export const processInstrumentsData = (result: InstrumentPublicResponseSchema[]): InstrumentsMap => {
  const byName: Record<string, InstrumentPublicResponseSchema> = {}
  const expirySet = new Set<number>()
  const strikesByExpiry: Record<string, string[]> = {}

  result.forEach(instrument => {
    byName[instrument.instrument_name] = instrument
    expirySet.add(instrument.option_details.expiry)
    
    const expiryKey = instrument.option_details.expiry.toString()
    if (!strikesByExpiry[expiryKey]) {
      strikesByExpiry[expiryKey] = []
    }
    if (!strikesByExpiry[expiryKey].includes(instrument.option_details.strike)) {
      strikesByExpiry[expiryKey].push(instrument.option_details.strike)
    }
  })

  const sortedExpiryDates = Array.from(expirySet).sort((a, b) => a - b)
  Object.keys(strikesByExpiry).forEach(expiry => {
    strikesByExpiry[expiry].sort((a, b) => Number(a) - Number(b))
  })

  return {
    byName,
    expiryDates: sortedExpiryDates,
    strikesByExpiry
  }
}

const fetchInstrumentsData = async (
  selectedCurrency: SupportedCurrency,
  spotPrice: number | undefined,
  onSuccess: (data: { instruments: InstrumentsMap; expiry: string; strike: string }) => void,
  onError: () => void,
  isCanceled: () => boolean
) => {
  try {
    const { result } = await fetchInstruments({
      currency: selectedCurrency,
      expired: false,
      instrument_type: 'option'
    })
    
    if (isCanceled()) return

    const instrumentsMap = processInstrumentsData(result)
    let newExpiry = ''
    let newStrike = ''

    if (spotPrice && instrumentsMap.expiryDates.length > 0) {
      const { expiry, strike } = findNearestExpiryAndStrike(
        instrumentsMap.expiryDates,
        instrumentsMap.strikesByExpiry,
        spotPrice
      )
      newExpiry = expiry
      newStrike = strike
    }

    if (!isCanceled()) {
      onSuccess({
        instruments: instrumentsMap,
        expiry: newExpiry,
        strike: newStrike
      })
    }
  } catch (error) {
    if (!isCanceled()) {
      onError()
    }
  }
}

export function useInstruments(selectedCurrency: SupportedCurrency, spotPrice?: number) {
  const [instruments, setInstruments] = useState<InstrumentsMap>({
    byName: {},
    expiryDates: [],
    strikesByExpiry: {}
  })
  const [selectedExpiry, setSelectedExpiry] = useState<string>('')
  const [selectedStrike, setSelectedStrike] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!selectedCurrency || !spotPrice) return
    
    let isCanceled = false
    setIsLoading(true)

    const handleSuccess = ({ instruments, expiry, strike }: { instruments: InstrumentsMap; expiry: string; strike: string }) => {
      setInstruments(instruments)
      setSelectedExpiry(expiry)
      setSelectedStrike(strike)
      setIsLoading(false)
    }

    const handleError = () => {
      setInstruments({ byName: {}, expiryDates: [], strikesByExpiry: {} })
      setSelectedExpiry('')
      setSelectedStrike('')
      setIsLoading(false)
    }

    fetchInstrumentsData(
      selectedCurrency,
      spotPrice,
      handleSuccess,
      handleError,
      () => isCanceled
    )

    return () => {
      isCanceled = true
    }
  }, [selectedCurrency, spotPrice])

  useEffect(() => {
    if (!selectedExpiry || !instruments.strikesByExpiry[selectedExpiry]) return
    
    setSelectedStrike(prevStrike => {
      const strikes = instruments.strikesByExpiry[selectedExpiry]
      const comparePrice = prevStrike ? Number(prevStrike) : spotPrice || 0
      return findClosestStrike(strikes, comparePrice)
    })
  }, [selectedExpiry, instruments, spotPrice])

  return {
    instruments,
    isLoading,
    selectedExpiry,
    setSelectedExpiry,
    selectedStrike,
    setSelectedStrike
  }
} 
import { useState, useEffect } from 'react'
import { InstrumentPublicResponseSchema } from '@/types/public.get_instruments'
import { SupportedCurrency } from '@/types/currencies'
import fetchInstruments from '@/lib/api/fetch-instruments'

export type InstrumentsMap = {
  byName: Record<string, InstrumentPublicResponseSchema>
  expiryDates: number[]
  strikesByExpiry: Record<string, string[]>
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
    if (!selectedCurrency) return
    
    let isCanceled = false
    setIsLoading(true)
    
    fetchInstruments({
      currency: selectedCurrency,
      expired: false,
      instrument_type: 'option'
    }).then(({ result }) => {
      if (isCanceled) return

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

      // Sort expiry dates and strikes
      const sortedExpiryDates = Array.from(expirySet).sort((a, b) => a - b)
      Object.keys(strikesByExpiry).forEach(expiry => {
        strikesByExpiry[expiry].sort((a, b) => Number(a) - Number(b))
      })

      const instrumentsMap: InstrumentsMap = {
        byName,
        expiryDates: sortedExpiryDates,
        strikesByExpiry
      }

      let newExpiry = ''
      let newStrike = ''

      if (spotPrice && sortedExpiryDates.length > 0) {
        const currentTimestamp = Math.floor(Date.now() / 1000)
        const nearestExpiry = sortedExpiryDates
          .find(expiry => expiry > currentTimestamp)?.toString() || sortedExpiryDates[0].toString()

        if (nearestExpiry) {
          newExpiry = nearestExpiry
          const strikes = strikesByExpiry[nearestExpiry].map(Number)
          
          if (strikes.length) {
            const currentSpot = spotPrice
            const closestStrike = strikes.reduce((prev, curr) => 
              Math.abs(curr - currentSpot) < Math.abs(prev - currentSpot) ? curr : prev
            )
            newStrike = closestStrike.toString()
          }
        }
      }

      // Update everything at once
      if (!isCanceled) {
        setInstruments(instrumentsMap)
        setSelectedExpiry(newExpiry)
        setSelectedStrike(newStrike)
        setIsLoading(false)
      }
    }).catch(() => {
      if (!isCanceled) {
        setInstruments({ byName: {}, expiryDates: [], strikesByExpiry: {} })
        setSelectedExpiry('')
        setSelectedStrike('')
        setIsLoading(false)
      }
    })

    return () => {
      isCanceled = true
    }
  }, [selectedCurrency, spotPrice])

  // Add effect to handle expiry changes
  useEffect(() => {
    if (!selectedExpiry || !instruments.strikesByExpiry[selectedExpiry] || !spotPrice) return

    const strikes = instruments.strikesByExpiry[selectedExpiry].map(Number)
    if (strikes.length) {
      const closestStrike = strikes.reduce((prev, curr) => 
        Math.abs(curr - spotPrice) < Math.abs(prev - spotPrice) ? curr : prev
      )
      setSelectedStrike(closestStrike.toString())
    }
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
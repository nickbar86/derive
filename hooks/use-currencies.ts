import { useState, useEffect } from 'react'
import { SupportedCurrency, SupportedCurrencyResponse, isSupportedCurrency } from '@/types/currencies'
import fetchAllCurrencies from '@/lib/api/fetch-all-currencies'

export function useCurrencies() {
  const [currencies, setCurrencies] = useState<SupportedCurrencyResponse[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('BTC')

  useEffect(() => {
    fetchAllCurrencies().then(({ result }) => {
      const filteredResult = result.filter((c): c is SupportedCurrencyResponse => 
        isSupportedCurrency(c.currency)
      )
      setCurrencies(filteredResult)
    })
  }, [])

  return {
    currencies,
    selectedCurrency,
    setSelectedCurrency
  }
} 
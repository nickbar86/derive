import { useEffect,useState } from 'react'

import fetchAllCurrencies from '@/lib/api/fetch-all-currencies'
import { isSupportedCurrency,SupportedCurrency, SupportedCurrencyResponse } from '@/types/currencies'

export function useCurrencies() {
  const [currencies, setCurrencies] = useState<SupportedCurrencyResponse[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('BTC')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAllCurrencies().then(({ result }) => {
      const filteredResult = result.filter((c): c is SupportedCurrencyResponse => 
        isSupportedCurrency(c.currency)
      )
      setCurrencies(filteredResult)
      setIsLoading(false)
    })
  }, [])

  return {
    currencies,
    selectedCurrency,
    setSelectedCurrency,
    isLoading
  }
} 
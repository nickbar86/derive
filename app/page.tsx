'use client'

import React, { useEffect, useState } from 'react'
import { ThemeToggle } from '../components/ui/theme-toggle'
import fetchAllCurrencies from 'lib/api/fetch-all-currencies'
import { CurrencyResponseSchema } from 'types/public.get_all_currencies'
import { OptionsWizardCard } from '@/components/options-wizard-card'

export default function Home() {
  const [currencies, setCurrencies] = useState<CurrencyResponseSchema[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<string>('BTC')

  useEffect(() => {
    const fetch = async () => {
      const { result } = await fetchAllCurrencies()
      const filteredResult = result.filter(c => ['BTC', 'ETH'].includes(c.currency))
      setCurrencies(filteredResult)
    }
    fetch()
  }, [])

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <OptionsWizardCard 
        currencies={currencies}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
      />
    </div>
  )
}

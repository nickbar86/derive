'use client'

import React, { useEffect, useState } from 'react'

import fetchAllCurrencies from 'lib/api/fetch-all-currencies'
import { CurrencyResponseSchema } from 'types/public.get_all_currencies'
import { Skeleton } from 'components/ui/skeleton'

export default function Home() {
  const [currencies, setCurrencies] = useState<CurrencyResponseSchema[]>([])

  useEffect(() => {
    const fetch = async () => {
      const { result } = await fetchAllCurrencies()
      const filteredResult = result.filter(c => ['BTC', 'ETH'].includes(c.currency))
      setCurrencies(filteredResult)
    }
    fetch()
  }, [])

  return (
    <div className="min-h-screen flex flex-col justify-center items-center space-y-6">
      <Skeleton className="h-[40px] w-[650px] rounded-xl" />
      <Skeleton className="h-[24px] w-[400px] rounded-xl" />
      <Skeleton className="h-[24px] w-[300px] rounded-xl" />
    </div>
  )
}

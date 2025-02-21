import { createContext, PropsWithChildren,useContext } from 'react'

import { useCurrencies, useInstruments, useTicker } from '@/hooks'

type OptionsWizardContextType = Omit<ReturnType<typeof useCurrencies>, 'isLoading'> & 
  Omit<ReturnType<typeof useInstruments>, 'isLoading'> & 
  Omit<ReturnType<typeof useTicker>, 'isLoading'> & {
    spotPrice: number
    isLoadingCurrencies: boolean
    isLoadingInstruments: boolean
    isLoadingTicker: boolean
  }

const OptionsWizardContext = createContext<OptionsWizardContextType | null>(null)

export function OptionsWizardProvider({ children }: PropsWithChildren) {
  const { isLoading: isLoadingCurrencies, ...currenciesData } = useCurrencies()
  const selectedCurrencyData = currenciesData.currencies.find(c => c.currency === currenciesData.selectedCurrency)
  const spotPrice = selectedCurrencyData ? Number(selectedCurrencyData.spot_price) : 0

  const { isLoading: isLoadingInstruments, ...instrumentsData } = useInstruments(currenciesData.selectedCurrency, spotPrice)

  const { isLoading: isLoadingTicker, ...tickerData } = useTicker(
    currenciesData.selectedCurrency,
    instrumentsData.selectedExpiry,
    instrumentsData.selectedStrike,
    spotPrice,
    instrumentsData.instruments
  )

  return (
    <OptionsWizardContext.Provider value={{
      ...currenciesData,
      ...instrumentsData,
      ...tickerData,
      spotPrice,
      isLoadingCurrencies,
      isLoadingInstruments,
      isLoadingTicker
    }}>
      {children}
    </OptionsWizardContext.Provider>
  )
}

export function useOptionsWizard() {
  const context = useContext(OptionsWizardContext)
  if (!context) {
    throw new Error('useOptionsWizard must be used within an OptionsWizardProvider')
  }
  return context
} 
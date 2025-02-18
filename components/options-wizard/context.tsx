import { createContext, useContext, PropsWithChildren } from 'react'
import { useCurrencies, useInstruments, useTicker } from '@/hooks'
import { SupportedCurrency } from '@/types/currencies'

type OptionsWizardContextType = ReturnType<typeof useCurrencies> & 
  ReturnType<typeof useInstruments> & {
    spotPrice: number
  }

const OptionsWizardContext = createContext<OptionsWizardContextType | null>(null)

export function OptionsWizardProvider({ children }: PropsWithChildren) {
  const currenciesData = useCurrencies()
  const selectedCurrencyData = currenciesData.currencies.find(c => c.currency === currenciesData.selectedCurrency)
  const spotPrice = selectedCurrencyData ? Number(selectedCurrencyData.spot_price) : 0

  const instrumentsData = useInstruments(currenciesData.selectedCurrency, spotPrice)

  return (
    <OptionsWizardContext.Provider value={{
      ...currenciesData,
      ...instrumentsData,
      spotPrice
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
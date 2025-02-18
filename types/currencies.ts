import { CurrencyResponseSchema } from './public.get_all_currencies'

export const SUPPORTED_CURRENCIES = ['BTC', 'ETH'] as const
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]

export type SupportedCurrencyResponse = Omit<CurrencyResponseSchema, 'currency'> & {
  currency: SupportedCurrency
}

export function isSupportedCurrency(currency: string): currency is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency)
} 
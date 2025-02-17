import {
  PublicGetAllCurrenciesParamsSchema,
  PublicGetAllCurrenciesResponseSchema,
} from '../../types/public.get_all_currencies'
import tryApiRequest from './try-api-request'

export default async function fetchAllCurrencies(): Promise<PublicGetAllCurrenciesResponseSchema> {
  return tryApiRequest<PublicGetAllCurrenciesParamsSchema, PublicGetAllCurrenciesResponseSchema>(
    '/public/get_all_currencies',
    {}
  )
}

import { PublicGetTickerParamsSchema, PublicGetTickerResponseSchema } from '@/types/public.get_ticker'
import tryApiRequest from './try-api-request'

export default async function fetchTicker(params: PublicGetTickerParamsSchema): Promise<PublicGetTickerResponseSchema> {
  return tryApiRequest<PublicGetTickerParamsSchema, PublicGetTickerResponseSchema>('/public/get_ticker', params)
}

import {
  PublicGetInstrumentsParamsSchema,
  PublicGetInstrumentsResponseSchema,
} from '../../types/public.get_instruments'
import tryApiRequest from './try-api-request'

export default async function fetchInstruments(
  params: PublicGetInstrumentsParamsSchema
): Promise<PublicGetInstrumentsResponseSchema> {
  return tryApiRequest<PublicGetInstrumentsParamsSchema, PublicGetInstrumentsResponseSchema>(
    '/public/get_instruments',
    params
  )
}

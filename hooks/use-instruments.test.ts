import { renderHook, act, waitFor } from '@testing-library/react'
import { useInstruments } from './use-instruments'
import fetchInstruments from '@/lib/api/fetch-instruments'
import { SupportedCurrency } from '@/types/currencies'
import { InstrumentType1, OptionType } from '@/types/public.get_instruments'
import { findNearestExpiryAndStrike, findClosestStrike, processInstrumentsData } from './use-instruments'
import { InstrumentPublicResponseSchema } from '@/types/public.get_instruments'

const FIXED_TIMESTAMP = 1710892800 // March 20, 2024

jest.mock('@/lib/api/fetch-instruments')
const mockFetchInstruments = fetchInstruments as jest.MockedFunction<typeof fetchInstruments>

const createMockInstrument = (name: string, expiry: number, strike: string) => ({
  instrument_name: name,
  base_currency: 'BTC',
  quote_currency: 'USD',
  instrument_type: 'option' as InstrumentType1,
  amount_step: '0.1',
  min_trade_amount: '0.1',
  max_trade_amount: '10.0',
  option_details: {
    expiry,
    strike,
    index: 'BTC-USD',
    option_type: 'C' as OptionType
  },
  is_active: true,
  creation_timestamp: 1234567890,
  base_asset_address: '',
  base_asset_sub_id: '',
  quote_asset_address: '',
  quote_asset_sub_id: '',
  price_step: '0.1',
  tick_size: '0.1',
  taker_commission: '0.1',
  maker_commission: '0.1',
  settlement_currency: 'USD',
  settlement_asset_address: '',
  settlement_asset_sub_id: '',
  maker_fee_rate: '0.1',
  taker_fee_rate: '0.1',
  min_price: '0.1',
  max_price: '100000.0',
  maximum_amount: '10.0',
  minimum_amount: '0.1',
  price_decimals: 1,
  quantity_decimals: 1,
  perp_details: {
    index: 'BTC-USD',
    max_rate_per_hour: '0.1',
    min_rate_per_hour: '0.01',
    static_interest_rate: '0.05'
  },
  scheduled_activation: 0,
  scheduled_deactivation: 0
})

beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(FIXED_TIMESTAMP * 1000)
  })
  
afterAll(() => {
    jest.useRealTimers()
})

  
describe('useInstruments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchInstruments.mockResolvedValue({
      id: 1,
      result: []
    })
  })

  it('should initialize with empty state', async () => {
    const { result } = renderHook(() => useInstruments('BTC', 50000))

    expect(result.current.instruments).toEqual({
      byName: {},
      expiryDates: [],
      strikesByExpiry: {}
    })
    expect(result.current.selectedExpiry).toBe('')
    expect(result.current.selectedStrike).toBe('')
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should fetch and organize instruments correctly', async () => {
    const mockInstruments = [
      createMockInstrument('BTC-20240321-50000-C', 1710979200, '50000'),
      createMockInstrument('BTC-20240321-55000-C', 1710979200, '55000'),
      createMockInstrument('BTC-20240421-50000-C', 1713657600, '50000')
    ]

    mockFetchInstruments.mockResolvedValueOnce({
      id: 1,
      result: mockInstruments
    })

    const { result } = renderHook(() => useInstruments('BTC', 52000))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify instruments are organized correctly
    expect(Object.keys(result.current.instruments.byName)).toHaveLength(3)
    expect(result.current.instruments.expiryDates).toEqual([1710979200, 1713657600])
    expect(Object.keys(result.current.instruments.strikesByExpiry)).toHaveLength(2)

    // Verify strikes are sorted numerically
    expect(result.current.instruments.strikesByExpiry['1710979200']).toEqual(['50000', '55000'])
  })

  it('should auto-select nearest expiry and closest strike to spot price', async () => {
    // Use fixed timestamps relative to our mocked Date.now()
    const futureExpiry1 = FIXED_TIMESTAMP + 86400 // tomorrow
    const futureExpiry2 = FIXED_TIMESTAMP + 172800 // day after tomorrow

    const mockInstruments = [
      createMockInstrument('BTC-20240321-45000-C', futureExpiry1, '45000'),
      createMockInstrument('BTC-20240321-50000-C', futureExpiry1, '50000'),
      createMockInstrument('BTC-20240321-55000-C', futureExpiry1, '55000'),
      createMockInstrument('BTC-20240421-50000-C', futureExpiry2, '50000')
    ]

    mockFetchInstruments.mockResolvedValueOnce({
      id: 1,
      result: mockInstruments
    })

    const spotPrice = 52000
    const { result } = renderHook(() => useInstruments('BTC', spotPrice))

    // First verify loading state
    expect(result.current.isLoading).toBe(true)

    // Wait for all state updates to complete in a single waitFor
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(Object.keys(result.current.instruments.byName)).toHaveLength(4)
      expect(result.current.selectedExpiry).toBe(futureExpiry1.toString())
      expect(result.current.selectedStrike).toBe('50000')
    }, { timeout: 3000 })
  })

  it('should handle expiry change with auto strike selection', async () => {
    const mockInstruments = [
      createMockInstrument('BTC-20240321-45000-C', 1710979200, '45000'),
      createMockInstrument('BTC-20240321-50000-C', 1710979200, '50000'),
      createMockInstrument('BTC-20240421-55000-C', 1713657600, '55000')
    ]

    mockFetchInstruments.mockResolvedValueOnce({
      id: 1,
      result: mockInstruments
    })

    const { result } = renderHook(() => useInstruments('BTC', 52000))

    // Wait for all initial state updates in a single waitFor
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(Object.keys(result.current.instruments.byName)).toHaveLength(3)
      expect(result.current.selectedExpiry).toBe('1710979200')
      expect(result.current.selectedStrike).toBe('50000')
    }, { timeout: 3000 })

    // Change expiry and wait for auto-selection
    act(() => {
      result.current.setSelectedExpiry('1713657600')
    })

    // Wait for auto-selection after expiry change
    await waitFor(() => {
      expect(result.current.selectedStrike).toBe('55000')
    }, { timeout: 3000 })
  })

  it('should refetch when currency changes', async () => {
    const btcInstrument = createMockInstrument('BTC-20240321-50000-C', 1710979200, '50000')
    const ethInstrument = {
      ...createMockInstrument('ETH-20240321-3000-C', 1710979200, '3000'),
      base_currency: 'ETH'
    }

    mockFetchInstruments
      .mockResolvedValueOnce({
        id: 1,
        result: [btcInstrument]
      })
      .mockResolvedValueOnce({
        id: 2,
        result: [ethInstrument]
      })

    const { result, rerender } = renderHook(
      ({ currency, spotPrice }) => useInstruments(currency, spotPrice),
      { initialProps: { currency: 'BTC' as SupportedCurrency, spotPrice: 50000 } }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify BTC instruments loaded
    expect(Object.keys(result.current.instruments.byName)[0]).toContain('BTC')

    // Change currency to ETH
    rerender({ currency: 'ETH' as SupportedCurrency, spotPrice: 3000 })

    await waitFor(() => {
      expect(Object.keys(result.current.instruments.byName)[0]).toContain('ETH')
    })

    expect(mockFetchInstruments).toHaveBeenCalledTimes(2)
    expect(mockFetchInstruments).toHaveBeenCalledWith({
      currency: 'ETH',
      expired: false,
      instrument_type: 'option'
    })
  })

  it('should handle API errors gracefully', async () => {
    const error = new Error('API Error')
    mockFetchInstruments.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useInstruments('BTC', 50000))

    // First verify loading state
    expect(result.current.isLoading).toBe(true)

    // Then wait for error to be handled and state to be reset
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify all state is reset
    expect(result.current.instruments).toEqual({
      byName: {},
      expiryDates: [],
      strikesByExpiry: {}
    })
    expect(result.current.selectedExpiry).toBe('')
    expect(result.current.selectedStrike).toBe('')
  })
})

describe('findNearestExpiryAndStrike', () => {
  const mockTimestamp = 1645000000 // Some fixed timestamp for testing
  
  beforeEach(() => {
    jest.setSystemTime(mockTimestamp * 1000)
  })

  it('finds nearest future expiry and closest strike', () => {
    const expiryDates = [1644900000, 1645100000, 1645200000] // One past, two future
    const strikesByExpiry = {
      '1645100000': ['9000', '10000', '11000'],
    }
    const spotPrice = 10500

    const result = findNearestExpiryAndStrike(expiryDates, strikesByExpiry, spotPrice)
    expect(result).toEqual({
      expiry: '1645100000',
      strike: '11000'
    })
  })

  it('returns first expiry if no future expiry exists', () => {
    const expiryDates = [1644900000, 1644950000] // All past
    const strikesByExpiry = {
      '1644900000': ['9000', '10000', '11000'],
    }
    const spotPrice = 10500

    const result = findNearestExpiryAndStrike(expiryDates, strikesByExpiry, spotPrice)
    expect(result).toEqual({
      expiry: '1644900000',
      strike: '11000'
    })
  })

  it('handles empty strikes array', () => {
    const expiryDates = [1645100000]
    const strikesByExpiry = {
      '1645100000': [],
    }
    const spotPrice = 10500

    const result = findNearestExpiryAndStrike(expiryDates, strikesByExpiry, spotPrice)
    expect(result).toEqual({
      expiry: '1645100000',
      strike: ''
    })
  })

  it('handles empty expiry dates', () => {
    const result = findNearestExpiryAndStrike([], {}, 10500)
    expect(result).toEqual({
      expiry: '',
      strike: ''
    })
  })
})

describe('findClosestStrike', () => {
  it('finds exact match', () => {
    const strikes = ['9000', '10000', '11000']
    const spotPrice = 10000

    const result = findClosestStrike(strikes, spotPrice)
    expect(result).toBe('10000')
  })

  it('finds closest strike when spot is between strikes', () => {
    const strikes = ['9000', '10000', '11000']
    const spotPrice = 10600

    const result = findClosestStrike(strikes, spotPrice)
    expect(result).toBe('11000')
  })

  it('returns first strike when spot is below all strikes', () => {
    const strikes = ['9000', '10000', '11000']
    const spotPrice = 8000

    const result = findClosestStrike(strikes, spotPrice)
    expect(result).toBe('9000')
  })

  it('returns last strike when spot is above all strikes', () => {
    const strikes = ['9000', '10000', '11000']
    const spotPrice = 12000

    const result = findClosestStrike(strikes, spotPrice)
    expect(result).toBe('11000')
  })

  it('handles empty strikes array', () => {
    const result = findClosestStrike([], 10000)
    expect(result).toBe('')
  })
})

describe('processInstrumentsData', () => {
  it('processes raw instrument data correctly', () => {
    const mockInstruments: InstrumentPublicResponseSchema[] = [
      {
        instrument_name: 'BTC-1',
        option_details: {
          expiry: 1645100000,
          strike: '9000'
        }
      },
      {
        instrument_name: 'BTC-2',
        option_details: {
          expiry: 1645100000,
          strike: '10000'
        }
      },
      {
        instrument_name: 'BTC-3',
        option_details: {
          expiry: 1645200000,
          strike: '9000'
        }
      }
    ] as InstrumentPublicResponseSchema[]

    const result = processInstrumentsData(mockInstruments)

    expect(result.expiryDates).toEqual([1645100000, 1645200000])
    expect(result.strikesByExpiry['1645100000']).toEqual(['9000', '10000'])
    expect(result.strikesByExpiry['1645200000']).toEqual(['9000'])
    expect(Object.keys(result.byName).length).toBe(3)
  })

  it('handles empty input', () => {
    const result = processInstrumentsData([])
    expect(result).toEqual({
      byName: {},
      expiryDates: [],
      strikesByExpiry: {}
    })
  })
}) 
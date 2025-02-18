import { renderHook, waitFor } from '@testing-library/react'
import { useTicker } from './use-ticker'
import fetchTicker from '@/lib/api/get-ticker'
import { SupportedCurrency } from '@/types/currencies'
import { InstrumentsMap } from './use-instruments'
import { PublicGetTickerResponseSchema, PublicGetTickerResultSchema } from '@/types/public.get_ticker'
import { InstrumentPublicResponseSchema } from '@/types/public.get_instruments'

jest.mock('@/lib/api/get-ticker')
const mockFetchTicker = fetchTicker as jest.MockedFunction<typeof fetchTicker>

const mockInstrumentsMap: InstrumentsMap = {
  byName: {
    'BTC-20240321-50000-C': {
      instrument_name: 'BTC-20240321-50000-C',
      base_currency: 'BTC',
      quote_currency: 'USD',
      instrument_type: 'option',
      is_active: true,
      amount_step: '0.1',
      base_asset_address: '',
      base_asset_sub_id: '',
      maker_fee_rate: '0.1',
      max_price: '100000.0',
      maximum_amount: '10.0',
      min_price: '0.1',
      minimum_amount: '0.1',
      option_details: {
        expiry: 1710979200,
        strike: '50000',
        index: 'BTC-USD',
        option_type: 'C'
      },
      perp_details: {
        index: 'BTC-USD',
        max_rate_per_hour: '0.1',
        min_rate_per_hour: '0.01',
        static_interest_rate: '0.05'
      },
      scheduled_activation: 0,
      scheduled_deactivation: 0,
      taker_fee_rate: '0.1',
      tick_size: '0.1'
    } as InstrumentPublicResponseSchema,
    'BTC-20240321-45000-P': {
      instrument_name: 'BTC-20240321-45000-P',
      base_currency: 'BTC',
      quote_currency: 'USD',
      instrument_type: 'option',
      is_active: true,
      amount_step: '0.1',
      base_asset_address: '',
      base_asset_sub_id: '',
      maker_fee_rate: '0.1',
      max_price: '100000.0',
      maximum_amount: '10.0',
      min_price: '0.1',
      minimum_amount: '0.1',
      option_details: {
        expiry: 1710979200,
        strike: '45000',
        index: 'BTC-USD',
        option_type: 'P'
      },
      perp_details: {
        index: 'BTC-USD',
        max_rate_per_hour: '0.1',
        min_rate_per_hour: '0.01',
        static_interest_rate: '0.05'
      },
      scheduled_activation: 0,
      scheduled_deactivation: 0,
      taker_fee_rate: '0.1',
      tick_size: '0.1'
    } as InstrumentPublicResponseSchema
  },
  expiryDates: [1710979200],
  strikesByExpiry: {
    '1710979200': ['45000', '50000']
  }
}

const mockTickerResponse: PublicGetTickerResponseSchema = {
  id: 1,
  result: {
    amount_step: '0.1',
    base_asset_address: '',
    base_asset_sub_id: '',
    base_currency: 'BTC',
    base_fee: '0',
    best_bid_price: '1000.5',
    best_bid_amount: '0.1',
    best_ask_price: '1100.5',
    best_ask_amount: '0.2',
    erc20_details: null,
    fifo_min_allocation: '0.1',
    five_percent_ask_depth: '1.0',
    five_percent_bid_depth: '1.0',
    index_price: '49000',
    instrument_name: 'BTC-20240321-50000-C',
    instrument_type: 'option',
    is_active: true,
    maker_fee_rate: '0.1',
    mark_price: '1050.5',
    max_price: '100000.0',
    maximum_amount: '10.0',
    min_price: '0.1',
    minimum_amount: '0.1',
    open_interest: {},
    option_details: {
      expiry: 1710979200,
      index: 'BTC-USD',
      option_type: 'C',
      strike: '50000'
    },
    option_pricing: {
      ask_iv: '80.0',
      bid_iv: '79.0',
      delta: '0.5',
      discount_factor: '1.0',
      forward_price: '49000',
      gamma: '0.0001',
      iv: '80.5',
      mark_price: '1050.5',
      rho: '10',
      theta: '-100',
      vega: '100'
    },
    perp_details: null,
    pro_rata_amount_step: '0.1',
    pro_rata_fraction: '0.5',
    quote_currency: 'USD',
    scheduled_activation: 0,
    scheduled_deactivation: 0,
    stats: {
      contract_volume: '100',
      high: '1200',
      low: '900',
      num_trades: '50',
      open_interest: '10.5',
      percent_change: '5',
      usd_change: '50'
    },
    taker_fee_rate: '0.2',
    tick_size: '0.1',
    timestamp: 1710892800000
  }
}

describe('useTicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchTicker.mockResolvedValue(mockTickerResponse)
  })

  it('should initialize with undefined ticker and loading false', () => {
    const { result } = renderHook(() => 
      useTicker('BTC', '', '', 49000, mockInstrumentsMap)
    )

    expect(result.current.ticker).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('should fetch ticker for a call option when strike is above spot', async () => {
    const { result } = renderHook(() => 
      useTicker(
        'BTC' as SupportedCurrency,
        '1710979200',
        '50000',
        49000,
        mockInstrumentsMap
      )
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.ticker).toEqual(mockTickerResponse.result)
    })

    expect(mockFetchTicker).toHaveBeenCalledWith({
      instrument_name: 'BTC-20240321-50000-C'
    })
  })

  it('should fetch ticker for a put option when strike is below spot', async () => {
    const { result } = renderHook(() => 
      useTicker(
        'BTC' as SupportedCurrency,
        '1710979200',
        '45000',
        49000,
        mockInstrumentsMap
      )
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.ticker).toEqual(mockTickerResponse.result)
    })

    expect(mockFetchTicker).toHaveBeenCalledWith({
      instrument_name: 'BTC-20240321-45000-P'
    })
  })

  it('should handle API errors gracefully', async () => {
    mockFetchTicker.mockRejectedValueOnce(new Error('API Error'))

    const { result } = renderHook(() => 
      useTicker(
        'BTC' as SupportedCurrency,
        '1710979200',
        '50000',
        49000,
        mockInstrumentsMap
      )
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.ticker).toBeUndefined()
    })
  })

  it('should reset ticker when required params are missing', () => {
    const { result, rerender } = renderHook(
      ({ currency, expiry, strike, spot, instruments }) => 
        useTicker(currency, expiry, strike, spot, instruments),
      {
        initialProps: {
          currency: 'BTC' as SupportedCurrency,
          expiry: '1710979200',
          strike: '50000',
          spot: 49000,
          instruments: mockInstrumentsMap
        }
      }
    )

    // Wait for initial fetch
    waitFor(() => {
      expect(result.current.ticker).toBeDefined()
    })

    // Remove expiry
    rerender({
      currency: 'BTC' as SupportedCurrency,
      expiry: '',
      strike: '50000',
      spot: 49000,
      instruments: mockInstrumentsMap
    })

    expect(result.current.ticker).toBeUndefined()
  })

  it('should reset ticker when instrument is not found', () => {
    const { result } = renderHook(() => 
      useTicker(
        'BTC' as SupportedCurrency,
        '1710979200',
        '60000', // Non-existent strike
        49000,
        mockInstrumentsMap
      )
    )

    expect(result.current.ticker).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })
}) 
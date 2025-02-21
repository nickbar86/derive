import { act, renderHook, waitFor } from '@testing-library/react'

import fetchAllCurrencies from '@/lib/api/fetch-all-currencies'

import { useCurrencies } from './use-currencies'

// Mock the API call
jest.mock('@/lib/api/fetch-all-currencies')
const mockFetchAllCurrencies = fetchAllCurrencies as jest.MockedFunction<typeof fetchAllCurrencies>

describe('useCurrencies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set up default mock to prevent undefined errors
    mockFetchAllCurrencies.mockResolvedValue({
      id: 1,
      result: []
    })
  })

  it('should initialize with empty currencies and BTC as default', async () => {
    const { result } = renderHook(() => useCurrencies())
    
    expect(result.current.currencies).toEqual([])
    expect(result.current.selectedCurrency).toBe('BTC')

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(mockFetchAllCurrencies).toHaveBeenCalled()
    })
  })

  it('should filter out unsupported currencies', async () => {
    mockFetchAllCurrencies.mockResolvedValueOnce({
      id: 1,
      result: [
        { currency: 'BTC', spot_price: '50000', spot_price_24h: '49000' },
        { currency: 'ETH', spot_price: '3000', spot_price_24h: '2900' },
        { currency: 'SOL', spot_price: '100', spot_price_24h: '95' },
        { currency: 'DOGE', spot_price: '0.1', spot_price_24h: '0.09' }
      ]
    })

    const { result } = renderHook(() => useCurrencies())

    // Wait for the hook to process the API response
    await waitFor(() => {
      expect(result.current.currencies).toHaveLength(2)
    })

    // Verify only BTC and ETH are included
    expect(result.current.currencies).toEqual([
      { currency: 'BTC', spot_price: '50000', spot_price_24h: '49000' },
      { currency: 'ETH', spot_price: '3000', spot_price_24h: '2900' }
    ])
  })

  it('should handle empty API response', async () => {
    mockFetchAllCurrencies.mockResolvedValueOnce({
      id: 1,
      result: []
    })

    const { result } = renderHook(() => useCurrencies())

    await waitFor(() => {
      expect(mockFetchAllCurrencies).toHaveBeenCalled()
    })
    expect(result.current.currencies).toEqual([])
  })

  it('should handle API response with no supported currencies', async () => {
    mockFetchAllCurrencies.mockResolvedValueOnce({
      id: 1,
      result: [
        { currency: 'SOL', spot_price: '100', spot_price_24h: '95' },
        { currency: 'DOGE', spot_price: '0.1', spot_price_24h: '0.09' }
      ]
    })

    const { result } = renderHook(() => useCurrencies())

    await waitFor(() => {
      expect(mockFetchAllCurrencies).toHaveBeenCalled()
    })
    expect(result.current.currencies).toEqual([])
  })

  it('should maintain selected currency when currencies are loaded', async () => {
    mockFetchAllCurrencies.mockResolvedValueOnce({
      id: 1,
      result: [
        { currency: 'BTC', spot_price: '50000', spot_price_24h: '49000' },
        { currency: 'ETH', spot_price: '3000', spot_price_24h: '2900' }
      ]
    })

    const { result } = renderHook(() => useCurrencies())

    // Initial state should have BTC selected
    expect(result.current.selectedCurrency).toBe('BTC')

    // Change selected currency
    await act(async () => {
      result.current.setSelectedCurrency('ETH')
    })
    expect(result.current.selectedCurrency).toBe('ETH')

    // Wait for currencies to load and verify selection is maintained
    await waitFor(() => {
      expect(result.current.currencies).toHaveLength(2)
    })
    expect(result.current.selectedCurrency).toBe('ETH')
  })
}) 
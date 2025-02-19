import { render, screen } from '@testing-library/react'
import { RecommendedOption } from './recommended-option'
import { useOptionsWizard } from './context'

// Mock the hooks
jest.mock('./context')

const mockUseOptionsWizard = useOptionsWizard as jest.MockedFunction<typeof useOptionsWizard>

describe('RecommendedOption', () => {
  const mockCallInstrument = {
    instrument_name: 'BTC-20240321-50000-C',
    option_details: {
      expiry: 1710979200,
      strike: '50000'
    }
  }

  const mockPutInstrument = {
    instrument_name: 'BTC-20240321-50000-P',
    option_details: {
      expiry: 1710979200,
      strike: '50000'
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseOptionsWizard.mockReturnValue({
      selectedCurrency: 'BTC',
      spotPrice: 45000,
      instruments: {
        byName: {
          'BTC-20240321-50000-C': mockCallInstrument
        }
      },
      isLoadingInstruments: false,
      isLoadingTicker: false,
      selectedExpiry: '1710979200',
      selectedStrike: '50000',
      ticker: {
        best_bid_price: '1000',
        best_ask_price: '1100'
      }
    } as any)
  })

  it('renders loading state', () => {
    mockUseOptionsWizard.mockReturnValue({
      ...mockUseOptionsWizard(),
      isLoadingInstruments: true
    } as any)

    render(<RecommendedOption />)
    
    // Should show multiple skeletons
    const skeletons = screen.getAllByTestId('loading-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders loading state when ticker is loading', () => {
    mockUseOptionsWizard.mockReturnValue({
      ...mockUseOptionsWizard(),
      isLoadingTicker: true
    } as any)

    render(<RecommendedOption />)
    const skeletons = screen.getAllByTestId('loading-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders empty container when no recommended instrument and not loading', () => {
    mockUseOptionsWizard.mockReturnValue({
      ...mockUseOptionsWizard(),
      selectedStrike: '',
      isLoadingInstruments: false,
      isLoadingTicker: false
    } as any)

    render(<RecommendedOption />)
    expect(screen.getByTestId('empty-container')).toBeInTheDocument()
  })

  it('renders call option recommendation', () => {
    render(<RecommendedOption />)
    
    expect(screen.getByText('Recommended Option')).toBeInTheDocument()
    expect(screen.getByText('BTC-20240321-50000-C')).toBeInTheDocument()
    expect(screen.getByText('(Call option)')).toBeInTheDocument()
    expect(screen.getByText('Buy if you expect BTC to rise above $50000.00')).toBeInTheDocument()
  })

  it('renders put option recommendation', () => {
    mockUseOptionsWizard.mockReturnValue({
      ...mockUseOptionsWizard(),
      spotPrice: 55000,
      instruments: {
        byName: {
          'BTC-20240321-50000-P': mockPutInstrument
        }
      }
    } as any)

    render(<RecommendedOption />)
    
    expect(screen.getByText('(Put option)')).toBeInTheDocument()
    expect(screen.getByText('Buy if you expect BTC to fall below $50000.00')).toBeInTheDocument()
  })

  it('renders ticker prices when available', () => {
    render(<RecommendedOption />)
    
    expect(screen.getByText('Best Bid:')).toBeInTheDocument()
    expect(screen.getByText('$1000.00')).toBeInTheDocument()
    expect(screen.getByText('Best Ask:')).toBeInTheDocument()
    expect(screen.getByText('$1100.00')).toBeInTheDocument()
  })
}) 
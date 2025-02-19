import { render, screen } from '@testing-library/react'
import { RecommendedOption } from './recommended-option'
import { useOptionsWizard } from './context'
import { useTicker } from '@/hooks'

// Mock the hooks
jest.mock('./context')
jest.mock('@/hooks')

const mockUseOptionsWizard = useOptionsWizard as jest.MockedFunction<typeof useOptionsWizard>
const mockUseTicker = useTicker as jest.MockedFunction<typeof useTicker>

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
      isLoading: false,
      selectedExpiry: '1710979200',
      selectedStrike: '50000'
    } as any)

    mockUseTicker.mockReturnValue({
      ticker: {
        best_bid_price: '1000',
        best_ask_price: '1100'
      },
      isLoading: false
    } as any)
  })

  it('renders loading state', () => {
    mockUseOptionsWizard.mockReturnValue({
      ...mockUseOptionsWizard(),
      isLoading: true
    } as any)

    render(<RecommendedOption />)
    
    // Should show multiple skeletons
    const skeletons = screen.getAllByTestId('loading-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders loading state when ticker is loading', () => {
    mockUseTicker.mockReturnValue({
      ticker: null,
      isLoading: true
    } as any)

    render(<RecommendedOption />)
    const skeletons = screen.getAllByTestId('loading-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders nothing when no recommended instrument and not loading', () => {
    mockUseOptionsWizard.mockReturnValue({
      ...mockUseOptionsWizard(),
      selectedStrike: '',
      isLoading: false
    } as any)

    mockUseTicker.mockReturnValue({
      ticker: null,
      isLoading: false
    } as any)

    const { container } = render(<RecommendedOption />)
    expect(container).toBeEmptyDOMElement()
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
import { render, screen, fireEvent } from '@testing-library/react'
import { CurrencySelector } from './currency-selector'
import { useOptionsWizard } from './context'

// Mock the context hook
jest.mock('./context')
const mockUseOptionsWizard = useOptionsWizard as jest.MockedFunction<typeof useOptionsWizard>

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Check: () => null,
  ChevronDown: () => null,
  ChevronUp: () => null
}))

describe('CurrencySelector', () => {
  const mockCurrencies = [
    { currency: 'BTC', spot_price: '50000', spot_price_24h: '49000' },
    { currency: 'ETH', spot_price: '3000', spot_price_24h: '2900' }
  ]

  const mockSetSelectedCurrency = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseOptionsWizard.mockReturnValue({
      currencies: mockCurrencies,
      selectedCurrency: 'BTC',
      setSelectedCurrency: mockSetSelectedCurrency,
      spotPrice: '50000',
      isLoading: false
    } as any)
  })

  it('renders the currency selector with label', () => {
    render(<CurrencySelector />)
    expect(screen.getByText('1. Select your currency')).toBeInTheDocument()
  })

  it('displays 24h price change for selected currency', () => {
    render(<CurrencySelector />)
    expect(screen.getByTestId('price-change')).toHaveTextContent('24h change: $1000.00')
  })

  it('renders select with all currency options', () => {
    render(<CurrencySelector />)
    
    // Open the select dropdown
    fireEvent.click(screen.getByRole('combobox'))
    
    // Check if both currencies are listed
    expect(screen.getAllByText('BTC')[0]).toBeInTheDocument()
    expect(screen.getAllByText('$50000.00')[0]).toBeInTheDocument()
    expect(screen.getAllByText('ETH')[0]).toBeInTheDocument()
    expect(screen.getAllByText('$3000.00')[0]).toBeInTheDocument()
  })

  it('shows price change indicators correctly', () => {
    render(<CurrencySelector />)
    
    // Open the select dropdown
    fireEvent.click(screen.getByRole('combobox'))
    
    // BTC: (50000 - 49000) / 49000 * 100 ≈ 2.04%
    const btcPriceChange = screen.getAllByTestId('price-change-BTC')[0]
    expect(btcPriceChange).toHaveTextContent('↑2.04%')

    // ETH: (3000 - 2900) / 2900 * 100 ≈ 3.45%
    const ethPriceChange = screen.getAllByTestId('price-change-ETH')[0]
    expect(ethPriceChange).toHaveTextContent('↑3.45%')
  })

  it('calls setSelectedCurrency when a new currency is selected', () => {
    render(<CurrencySelector />)
    
    // Open the select dropdown
    fireEvent.click(screen.getByRole('combobox'))
    
    // Select ETH
    fireEvent.click(screen.getAllByText('ETH')[0])
    expect(mockSetSelectedCurrency).toHaveBeenCalledWith('ETH')
  })

  it('handles zero price change correctly', () => {
    mockUseOptionsWizard.mockReturnValue({
      currencies: [
        { currency: 'BTC', spot_price: '50000', spot_price_24h: '50000' }
      ],
      selectedCurrency: 'BTC',
      setSelectedCurrency: mockSetSelectedCurrency,
      spotPrice: '50000'
    } as any)

    render(<CurrencySelector />)
    expect(screen.getByTestId('price-change')).toHaveTextContent('24h change: $0.00')
  })

  it('renders loading skeletons when loading', () => {
    mockUseOptionsWizard.mockReturnValue({
      currencies: [],
      selectedCurrency: 'BTC',
      setSelectedCurrency: mockSetSelectedCurrency,
      spotPrice: '50000',
      isLoading: true
    } as any)

    render(<CurrencySelector />)
    const skeletons = screen.getAllByTestId('loading-skeleton')
    expect(skeletons).toHaveLength(2)
  })
}) 
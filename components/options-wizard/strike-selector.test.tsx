import { render, screen, fireEvent } from '@testing-library/react'
import { StrikeSelector } from './strike-selector'
import { useOptionsWizard } from './context'
import formatUSD from '@/lib/format-usd'

// Mock the context hook
jest.mock('./context')
const mockUseOptionsWizard = useOptionsWizard as jest.MockedFunction<typeof useOptionsWizard>

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Check: () => null,
  ChevronDown: () => null,
  ChevronUp: () => null
}))

describe('StrikeSelector', () => {
  const mockSetSelectedStrike = jest.fn()
  const mockExpiryDates = [1710979200] // March 21, 2024
  const mockStrikesByExpiry = {
    '1710979200': ['45000', '50000', '55000']
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseOptionsWizard.mockReturnValue({
      selectedCurrency: 'BTC',
      spotPrice: 52000,
      instruments: {
        expiryDates: mockExpiryDates,
        strikesByExpiry: mockStrikesByExpiry
      },
      isLoadingInstruments: false,
      selectedExpiry: '1710979200',
      selectedStrike: '',
      setSelectedStrike: mockSetSelectedStrike
    } as any)
  })

  it('renders the strike selector with label', () => {
    render(<StrikeSelector />)
    expect(screen.getByText('2. Choose your target price')).toBeInTheDocument()
    expect(screen.getByText('Current price: $52000.00')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseOptionsWizard.mockReturnValue({
      ...mockUseOptionsWizard(),
      isLoadingInstruments: true
    } as any)

    render(<StrikeSelector />)
    expect(screen.getByTestId('strike-loading')).toBeInTheDocument()
  })

  it('shows disabled state when no currency selected', () => {
    mockUseOptionsWizard.mockReturnValue({
      ...mockUseOptionsWizard(),
      selectedCurrency: ''
    } as any)

    render(<StrikeSelector />)
    expect(screen.getByRole('combobox')).toBeDisabled()
    expect(screen.getByText('Select currency first')).toBeInTheDocument()
  })

  it('shows disabled state when no expiry selected', () => {
    mockUseOptionsWizard.mockReturnValue({
      ...mockUseOptionsWizard(),
      selectedExpiry: ''
    } as any)

    render(<StrikeSelector />)
    expect(screen.getByRole('combobox')).toBeDisabled()
    expect(screen.getByText('Select expiry first')).toBeInTheDocument()
  })

  it('shows disabled state when no strikes available', () => {
    mockUseOptionsWizard.mockReturnValue({
      ...mockUseOptionsWizard(),
      instruments: {
        expiryDates: mockExpiryDates,
        strikesByExpiry: { '1710979200': [] }
      }
    } as any)

    render(<StrikeSelector />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('renders select with all strike options', () => {
    render(<StrikeSelector />)
    
    // Open the select dropdown
    fireEvent.click(screen.getByRole('combobox'))
    
    // Check if all strikes are listed with formatted prices
    mockStrikesByExpiry['1710979200'].forEach(strike => {
      expect(screen.getByText(`$${strike}.00`)).toBeInTheDocument()
    })
  })

  it('handles strike selection', () => {
    render(<StrikeSelector />)
    
    // Open the select dropdown
    fireEvent.click(screen.getByRole('combobox'))
    
    // Select a strike price
    fireEvent.click(screen.getByText('$50000.00'))
    
    // Check if setSelectedStrike was called with correct value
    expect(mockSetSelectedStrike).toHaveBeenCalledWith('50000')
  })
}) 
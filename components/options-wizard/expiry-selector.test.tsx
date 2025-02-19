import { render, screen, fireEvent } from '@testing-library/react'
import { ExpirySelector } from './expiry-selector'
import { useOptionsWizard } from './context'
import formatDate from '@/lib/format-date'

// Mock the context hook
jest.mock('./context')
const mockUseOptionsWizard = useOptionsWizard as jest.MockedFunction<typeof useOptionsWizard>

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Check: () => null,
  ChevronDown: () => null,
  ChevronUp: () => null
}))

describe('ExpirySelector', () => {
  const mockSetSelectedExpiry = jest.fn()
  const mockSetSelectedStrike = jest.fn()
  const mockExpiryDates = [1710979200, 1713657600] // March 21, 2024 and April 21, 2024
  const mockStrikesByExpiry = {
    '1710979200': ['45000', '50000'],
    '1713657600': ['55000', '60000']
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
      isLoading: false,
      selectedExpiry: '',
      setSelectedExpiry: mockSetSelectedExpiry,
      setSelectedStrike: mockSetSelectedStrike
    } as any)
  })

  it('renders the expiry selector with label', () => {
    render(<ExpirySelector />)
    expect(screen.getByText('3. Pick your timeframe')).toBeInTheDocument()
    expect(screen.getByText('When do you expect to reach your target?')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseOptionsWizard.mockReturnValue({
      ...mockUseOptionsWizard(),
      isLoading: true
    } as any)

    render(<ExpirySelector />)
    expect(screen.getByTestId('expiry-loading')).toBeInTheDocument()
  })

  it('shows disabled state when no currency selected', () => {
    mockUseOptionsWizard.mockReturnValue({
      ...mockUseOptionsWizard(),
      selectedCurrency: ''
    } as any)

    render(<ExpirySelector />)
    expect(screen.getByRole('combobox')).toBeDisabled()
    expect(screen.getByText('Select currency first')).toBeInTheDocument()
  })

  it('shows disabled state when no expiry dates available', () => {
    mockUseOptionsWizard.mockReturnValue({
      ...mockUseOptionsWizard(),
      instruments: {
        expiryDates: [],
        strikesByExpiry: {}
      }
    } as any)

    render(<ExpirySelector />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('renders select with all expiry options', () => {
    render(<ExpirySelector />)
    
    // Open the select dropdown
    fireEvent.click(screen.getByRole('combobox'))
    
    // Check if both expiry dates are listed with formatted dates
    mockExpiryDates.forEach(expiry => {
      expect(screen.getByText(formatDate(expiry))).toBeInTheDocument()
    })
  })
}) 
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Preferences from '../../../../frontend/src/views/Profile/Preferences.jsx'
import { AuthProvider } from '../../../../frontend/src/contexts/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'

vi.mock('axios')

// Helper do renderowania
const renderPreferences = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <Preferences />
      </AuthProvider>
    </BrowserRouter>
  )

describe('Preferences Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock axios.get na pobieranie preferencji
    axios.get.mockResolvedValueOnce({
      data: {
        dietType: 'normal',
        maxCarbs: 0,
        excludedProducts: [],
        allergens: []
      }
    })
  })

  it('renderuje formularz preferencji', async () => {
    renderPreferences()
    await waitFor(() => {
      expect(screen.getByText('Edycja preferencji dietetycznych')).toBeInTheDocument()
      expect(screen.getByLabelText('Typ diety:')).toBeInTheDocument()
      expect(screen.getByLabelText('Maksymalna liczba węglowodanów (g):')).toBeInTheDocument()
      expect(screen.getByText('Alergeny')).toBeInTheDocument()
    })
  })

  it('pozwala zaznaczyć alergen', async () => {
    renderPreferences()
    await waitFor(() => {
      const checkbox = screen.getByLabelText('Orzechy')
      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })
  })

  it('pozwala dodać wykluczony produkt', async () => {
    renderPreferences()
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Dodaj produkt do wykluczenia')
      fireEvent.change(input, { target: { value: 'Cebula' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
      expect(screen.getByText('Cebula')).toBeInTheDocument()
    })
  })

  it('pozwala zmienić typ diety', async () => {
    renderPreferences()
    await waitFor(() => {
      const select = screen.getByLabelText('Typ diety:')
      fireEvent.change(select, { target: { value: 'keto' } })
      expect(select.value).toBe('keto')
    })
  })

  it('pozwala zmienić liczbę węglowodanów', async () => {
    renderPreferences()
    await waitFor(() => {
      const input = screen.getByLabelText('Maksymalna liczba węglowodanów (g):')
      fireEvent.change(input, { target: { value: '50' } })
      expect(input.value).toBe('50')
    })
  })

  it('zapisuje preferencje poprawnie', async () => {
    axios.put.mockResolvedValueOnce({ data: {} })
    renderPreferences()
    await waitFor(() => {
      const button = screen.getByText('Zapisz preferencje')
      fireEvent.click(button)
    })
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/api/users/preferences',
        expect.any(Object),
        expect.objectContaining({ headers: expect.any(Object) })
      )
    })
  })

  it('wyświetla błąd przy nieudanym zapisie', async () => {
    axios.put.mockRejectedValueOnce(new Error('Błąd'))
    renderPreferences()
    await waitFor(() => {
      const button = screen.getByText('Zapisz preferencje')
      fireEvent.click(button)
    })
    await waitFor(() => {
      expect(screen.getByText('Nie udało się zapisać preferencji. Spróbuj ponownie później.')).toBeInTheDocument()
    })
  })
}) 
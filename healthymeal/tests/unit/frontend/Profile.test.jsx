import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Profile } from '../../../../frontend/src/components/Profile'
import { AuthProvider } from '../../../../frontend/src/contexts/AuthContext'
import { BrowserRouter } from 'react-router-dom'

// Mock dla fetch
global.fetch = vi.fn()

describe('Profile Component', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: '2024-01-01T00:00:00.000Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock dla fetch zwracający dane użytkownika
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser)
    })
  })

  it('should render profile information', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Profile />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Profil użytkownika')).toBeInTheDocument()
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  it('should handle name update', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Profile />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const nameInput = screen.getByLabelText('Imię i nazwisko')
      fireEvent.change(nameInput, { target: { value: 'New Name' } })
      expect(nameInput.value).toBe('New Name')
    })
  })

  it('should handle avatar upload', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ avatar_url: 'https://example.com/new-avatar.jpg' })
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <Profile />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const fileInput = screen.getByLabelText('Zmień avatar')
      fireEvent.change(fileInput, { target: { files: [mockFile] } })
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/profile/avatar'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          })
        })
      )
    })
  })

  it('should handle password change', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Hasło zmienione' })
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <Profile />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const currentPasswordInput = screen.getByLabelText('Aktualne hasło')
      const newPasswordInput = screen.getByLabelText('Nowe hasło')
      const confirmPasswordInput = screen.getByLabelText('Potwierdź nowe hasło')

      fireEvent.change(currentPasswordInput, { target: { value: 'oldpass123' } })
      fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } })

      const changePasswordButton = screen.getByText('Zmień hasło')
      fireEvent.click(changePasswordButton)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/profile/password'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })
  })

  it('should show error when password change fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to change password'))

    render(
      <BrowserRouter>
        <AuthProvider>
          <Profile />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const currentPasswordInput = screen.getByLabelText('Aktualne hasło')
      const newPasswordInput = screen.getByLabelText('Nowe hasło')
      const confirmPasswordInput = screen.getByLabelText('Potwierdź nowe hasło')

      fireEvent.change(currentPasswordInput, { target: { value: 'oldpass123' } })
      fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } })

      const changePasswordButton = screen.getByText('Zmień hasło')
      fireEvent.click(changePasswordButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Wystąpił błąd podczas zmiany hasła')).toBeInTheDocument()
    })
  })

  it('should handle account deletion', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Konto usunięte' })
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <Profile />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const deleteButton = screen.getByText('Usuń konto')
      fireEvent.click(deleteButton)
    })

    await waitFor(() => {
      const confirmButton = screen.getByText('Potwierdź usunięcie')
      fireEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/profile'),
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })

  it('should show error when account deletion fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to delete account'))

    render(
      <BrowserRouter>
        <AuthProvider>
          <Profile />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const deleteButton = screen.getByText('Usuń konto')
      fireEvent.click(deleteButton)
    })

    await waitFor(() => {
      const confirmButton = screen.getByText('Potwierdź usunięcie')
      fireEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Wystąpił błąd podczas usuwania konta')).toBeInTheDocument()
    })
  })
}) 
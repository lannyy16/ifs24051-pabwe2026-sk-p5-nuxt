import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as tools from '../../../helpers/toolsHelper'
import { renderWithProviders } from '../../../test-utils'
import { loginApi } from '../api/authApi'
import LoginPage from './LoginPage.vue'

vi.mock('../api/authApi')
vi.mock('../../../helpers/toolsHelper', () => ({
  showSuccessDialog: vi.fn().mockResolvedValue(undefined),
  showErrorDialog: vi.fn().mockResolvedValue(undefined),
}))

async function submit() {
  await fireEvent.update(screen.getByLabelText('Email'), 'a@b.c')
  await fireEvent.update(screen.getByLabelText('Kata sandi'), '123456')
  await fireEvent.submit(screen.getByRole('button', { name: 'Masuk' }))
}

beforeEach(() => vi.clearAllMocks())

describe('LoginPage', () => {
  it('login sukses menampilkan dialog dan menuju beranda', async () => {
    vi.mocked(loginApi).mockResolvedValue({
      status: 'success',
      message: 'Berhasil login',
      data: { user: { id: 1, name: 'A', email: 'a@b.c' }, token: 'tok' },
    })
    const { router } = await renderWithProviders(LoginPage, { route: '/auth/login' })
    await submit()
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/'))
    expect(loginApi).toHaveBeenCalledWith({ email: 'a@b.c', password: '123456' })
    expect(tools.showSuccessDialog).toHaveBeenCalledWith('Berhasil login')
  })

  it('login gagal menampilkan dialog error dan tetap di halaman', async () => {
    vi.mocked(loginApi).mockRejectedValue(new Error('Kredensial salah'))
    const { router } = await renderWithProviders(LoginPage, { route: '/auth/login' })
    await submit()
    await waitFor(() => expect(tools.showErrorDialog).toHaveBeenCalledWith('Kredensial salah'))
    expect(router.currentRoute.value.path).toBe('/auth/login')
  })

  it('menampilkan status memproses saat loading', async () => {
    await renderWithProviders(LoginPage, { initialState: { auth: { isLoading: true } } })
    expect(screen.getByRole('button', { name: 'Memproses...' })).toBeDisabled()
    expect(screen.getByText('Daftar')).toHaveAttribute('href', '/auth/register')
  })

  it('memiliki selector login yang dibutuhkan penilaian', async () => {
    await renderWithProviders(LoginPage, { route: '/auth/login' })
    expect(document.querySelector('#login-email-input')).toBeInTheDocument()
    expect(document.querySelector('#login-password-input')).toBeInTheDocument()
    expect(document.querySelector('#login-submit-button')).toBeInTheDocument()
  })
})

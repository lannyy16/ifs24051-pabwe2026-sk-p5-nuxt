import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as tools from '../../../helpers/toolsHelper'
import { renderWithProviders } from '../../../test-utils'
import { registerApi } from '../api/authApi'
import RegisterPage from './RegisterPage.vue'

vi.mock('../api/authApi')
vi.mock('../../../helpers/toolsHelper', () => ({
  showSuccessDialog: vi.fn().mockResolvedValue(undefined),
  showErrorDialog: vi.fn().mockResolvedValue(undefined),
}))

async function submit() {
  await fireEvent.update(screen.getByLabelText('Nama lengkap'), 'Budi')
  await fireEvent.update(screen.getByLabelText('Email'), 'a@b.c')
  await fireEvent.update(screen.getByLabelText('Kata sandi'), '123456')
  await fireEvent.submit(screen.getByRole('button', { name: 'Daftar' }))
}

beforeEach(() => vi.clearAllMocks())

describe('RegisterPage', () => {
  it('registrasi sukses mengarahkan ke login', async () => {
    vi.mocked(registerApi).mockResolvedValue({ status: 'success', message: 'Terdaftar', data: null })
    const { router } = await renderWithProviders(RegisterPage, { route: '/auth/register' })
    await submit()
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/auth/login'))
    expect(registerApi).toHaveBeenCalledWith({ name: 'Budi', email: 'a@b.c', password: '123456' })
    expect(tools.showSuccessDialog).toHaveBeenCalledWith('Terdaftar')
  })

  it('registrasi gagal menampilkan dialog error', async () => {
    vi.mocked(registerApi).mockRejectedValue(new Error('Email dipakai'))
    const { router } = await renderWithProviders(RegisterPage, { route: '/auth/register' })
    await submit()
    await waitFor(() => expect(tools.showErrorDialog).toHaveBeenCalledWith('Email dipakai'))
    expect(router.currentRoute.value.path).toBe('/auth/register')
  })

  it('menampilkan status memproses saat loading', async () => {
    await renderWithProviders(RegisterPage, { initialState: { auth: { isLoading: true } } })
    expect(screen.getByRole('button', { name: 'Memproses...' })).toBeDisabled()
    expect(screen.getByText('Masuk')).toHaveAttribute('href', '/auth/login')
  })
})

import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as tools from '../../../helpers/toolsHelper'
import { putAccessToken, getAccessToken } from '../../../helpers/apiHelper'
import { renderWithProviders, sampleUser } from '../../../test-utils'
import { logoutApi } from '../../auth/api/authApi'
import NavbarComponent from './NavbarComponent.vue'

vi.mock('../../auth/api/authApi')
vi.mock('../../../helpers/toolsHelper', () => ({ showConfirmDialog: vi.fn() }))

beforeEach(() => vi.resetAllMocks())

describe('NavbarComponent', () => {
  it('menampilkan nama, username, dan status sesi', async () => {
    await renderWithProviders(NavbarComponent, { initialState: { users: { profile: sampleUser } } })
    expect(screen.getByText('Delcom Testing')).toBeInTheDocument()
    expect(screen.getByText('@testing')).toBeInTheDocument()
    expect(screen.getByText('Sesi aktif')).toBeInTheDocument()
  })

  it('menampilkan placeholder saat profil belum dimuat', async () => {
    await renderWithProviders(NavbarComponent)
    expect(screen.getByText('Memuat profil...')).toBeInTheDocument()
  })

  it('mengirim event toggle-sidebar', async () => {
    const { emitted } = await renderWithProviders(NavbarComponent)
    await fireEvent.click(screen.getByLabelText('Buka menu'))
    expect(emitted()).toHaveProperty('toggle-sidebar')
  })

  it('logout setelah konfirmasi', async () => {
    putAccessToken('tok')
    vi.mocked(tools.showConfirmDialog).mockResolvedValue(true)
    vi.mocked(logoutApi).mockResolvedValue({ status: 'success', message: 'ok', data: null })
    const { router } = await renderWithProviders(NavbarComponent, { route: '/users' })
    await fireEvent.click(screen.getByRole('button', { name: /Keluar/ }))
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/auth/login'))
    expect(getAccessToken()).toBeNull()
  })

  it('membatalkan logout bila tidak dikonfirmasi', async () => {
    vi.mocked(tools.showConfirmDialog).mockResolvedValue(false)
    const { router } = await renderWithProviders(NavbarComponent, { route: '/users' })
    await fireEvent.click(screen.getByRole('button', { name: /Keluar/ }))
    await waitFor(() => expect(tools.showConfirmDialog).toHaveBeenCalled())
    expect(logoutApi).not.toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/users')
  })
})

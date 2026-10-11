import { screen, waitFor } from '@testing-library/vue'
import { defineComponent, h } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAccessToken, putAccessToken } from '../../../helpers/apiHelper'
import { renderWithProviders, sampleUser } from '../../../test-utils'
import { getMeApi } from '../../users/api/userApi'
import App from '../../../app.vue'
import CashFlowLayout from './CashFlowLayout.vue'

vi.mock('../../users/api/userApi')
vi.mock('../../auth/api/authApi')

const Child = defineComponent({ render: () => h('p', 'Konten Anak') })
const routes = [{ path: '/', component: CashFlowLayout, children: [{ path: '', component: Child }] }]

beforeEach(() => vi.resetAllMocks())

describe('CashFlowLayout', () => {
  it('mengalihkan ke login bila belum ada token', async () => {
    const { router } = await renderWithProviders(CashFlowLayout, { route: '/x' })
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/auth/login'))
    expect(getMeApi).not.toHaveBeenCalled()
  })

  it('memuat profil dan menampilkan konten terproteksi', async () => {
    putAccessToken('tok')
    vi.mocked(getMeApi).mockResolvedValue({ status: 'success', message: 'ok', data: { user: sampleUser } })
    await renderWithProviders(App, { route: '/', routes })
    expect(await screen.findByText('Konten Anak')).toBeInTheDocument()
    expect(screen.getByText('Delcom Testing')).toBeInTheDocument()
    expect(screen.getByText('Direktori Pengguna')).toBeInTheDocument()
  })

  it('membersihkan sesi dan ke login bila token tidak valid', async () => {
    putAccessToken('bad')
    vi.mocked(getMeApi).mockRejectedValue(new Error('Unauthenticated'))
    const { router } = await renderWithProviders(CashFlowLayout, { route: '/x' })
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/auth/login'))
    expect(getAccessToken()).toBeNull()
    expect(screen.queryByText('Konten Anak')).not.toBeInTheDocument()
  })

  it('membuka dan menutup sidebar dari navbar', async () => {
    putAccessToken('tok')
    vi.mocked(getMeApi).mockResolvedValue({ status: 'success', message: 'ok', data: { user: sampleUser } })
    await renderWithProviders(App, { route: '/', routes })
    await screen.findByText('Konten Anak')
    const { fireEvent } = await import('@testing-library/vue')
    await fireEvent.click(screen.getByLabelText('Buka menu'))
    expect(screen.getByTestId('sidebar')).toHaveClass('translate-x-0')
    await fireEvent.click(screen.getByText('Profil Saya'))
    await waitFor(() => expect(screen.getByTestId('sidebar')).toHaveClass('-translate-x-full'))
  })
})

import { screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as tools from '../../../helpers/toolsHelper'
import { renderWithProviders } from '../../../test-utils'
import { getUsersApi } from '../api/userApi'
import UsersPage from './UsersPage.vue'

vi.mock('../api/userApi')
vi.mock('../../../helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../helpers/toolsHelper')>()),
  showErrorDialog: vi.fn().mockResolvedValue(undefined),
}))

const ok = (data: unknown) => ({ status: 'success', message: 'ok', data }) as never

beforeEach(() => vi.clearAllMocks())

describe('UsersPage', () => {
  it('menampilkan daftar pengguna dengan foto atau inisial', async () => {
    vi.mocked(getUsersApi).mockResolvedValue(
      ok({
        users: [
          { id: 1, name: 'Budi', email: 'budi@delcom.org', photo: 'img/profile/1.png' },
          { id: 2, name: 'Siti', email: 'siti@delcom.org', photo: null },
        ],
      }),
    )
    await renderWithProviders(UsersPage)
    expect(screen.getByText('Memuat pengguna...')).toBeInTheDocument()
    expect(await screen.findAllByTestId('user-card')).toHaveLength(2)
    expect(screen.getByAltText('Budi')).toHaveAttribute('src', expect.stringContaining('/img/profile/1.png'))
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('menampilkan keadaan kosong', async () => {
    vi.mocked(getUsersApi).mockResolvedValue(ok({ users: [] }))
    await renderWithProviders(UsersPage)
    expect(await screen.findByText('Belum ada pengguna.')).toBeInTheDocument()
  })

  it('menampilkan dialog error saat gagal memuat', async () => {
    vi.mocked(getUsersApi).mockRejectedValue(new Error('gagal'))
    await renderWithProviders(UsersPage)
    await waitFor(() => expect(tools.showErrorDialog).toHaveBeenCalledWith('gagal'))
  })
})

import { fireEvent, screen, waitFor, within } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../api/cashFlowApi'
import * as tools from '../../../helpers/toolsHelper'
import { renderWithProviders } from '../../../test-utils'
import DetailPage from './DetailPage.vue'

vi.mock('../api/cashFlowApi')

vi.mock('../../../helpers/toolsHelper', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../helpers/toolsHelper')>()

  return {
    ...actual,
    showSuccessDialog: vi.fn().mockResolvedValue(undefined),
    showErrorDialog: vi.fn().mockResolvedValue(undefined),
    showConfirmDialog: vi.fn(),
  }
})

const cashFlow = {
  id: 7,
  title: 'alat-elektronik',
  amount: 400000,
  type: 'outflow',
  source: 'savings',
  label: 'alat-elektronik',
  description: 'Membeli keyboard',
  created_at: '2024-10-05T12:09:00.000Z',
  updated_at: '2024-10-06T12:09:00.000Z',
}

const ok = (data: unknown, message = 'Berhasil') =>
  ({
    status: 'success',
    message,
    data,
  }) as never

function mockGetCashFlow() {
  vi.mocked(api.getCashFlowApi).mockResolvedValue(
    ok({ cash_flow: cashFlow }),
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DetailPage', () => {
  it('menampilkan rincian transaksi pengeluaran', async () => {
    mockGetCashFlow()

    await renderWithProviders(DetailPage, { route: '/cashflows/7' })

    expect(
      await screen.findByRole('heading', { name: 'alat-elektronik' }),
    ).toBeInTheDocument()

    expect(screen.getByText('Pengeluaran')).toBeInTheDocument()
    expect(screen.getByText('Membeli keyboard')).toBeInTheDocument()
  })

  it('menampilkan badge pemasukan', async () => {
    vi.mocked(api.getCashFlowApi).mockResolvedValue(
      ok({ cash_flow: { ...cashFlow, type: 'inflow' } }),
    )

    await renderWithProviders(DetailPage, { route: '/cashflows/7' })

    expect(await screen.findByText('Pemasukan')).toBeInTheDocument()
  })

  it('menampilkan dialog error bila transaksi tidak ditemukan', async () => {
    vi.mocked(api.getCashFlowApi).mockRejectedValue(
      new Error('Transaksi tidak ditemukan'),
    )

    await renderWithProviders(DetailPage, { route: '/cashflows/7' })

    await waitFor(() => {
      expect(tools.showErrorDialog).toHaveBeenCalled()
    })
  })

  it('membuka dan menutup modal perubahan transaksi', async () => {
    mockGetCashFlow()

    await renderWithProviders(DetailPage, { route: '/cashflows/7' })

    expect(
      await screen.findByRole('heading', { name: 'alat-elektronik' }),
    ).toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: /ubah/i }))

    const dialog = await screen.findByRole('dialog', {
      name: 'Ubah transaksi',
    })

    expect(dialog).toBeInTheDocument()

    await fireEvent.click(
      within(dialog).getByRole('button', { name: 'Batal' }),
    )

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('memuat ulang detail setelah perubahan berhasil disimpan', async () => {
    mockGetCashFlow()

    vi.mocked(api.changeCashFlowApi).mockResolvedValue(
      ok(null, 'Transaksi berhasil diubah'),
    )

    await renderWithProviders(DetailPage, { route: '/cashflows/7' })

    expect(
      await screen.findByRole('heading', { name: 'alat-elektronik' }),
    ).toBeInTheDocument()

    const callsBefore = vi.mocked(api.getCashFlowApi).mock.calls.length

    await fireEvent.click(screen.getByRole('button', { name: /ubah/i }))

    const dialog = await screen.findByRole('dialog', {
      name: 'Ubah transaksi',
    })

    await fireEvent.update(
      within(dialog).getByLabelText('Label kategori'),
      'alat-elektronik',
    )

    await fireEvent.update(
      within(dialog).getByLabelText('Nominal (Rp)'),
      '400000',
    )

    await fireEvent.update(
      within(dialog).getByLabelText('Keterangan'),
      'Membeli keyboard',
    )

    await fireEvent.click(
      within(dialog).getByRole('button', {
        name: 'Simpan perubahan',
      }),
    )

    await waitFor(() => {
      expect(api.changeCashFlowApi).toHaveBeenCalledWith(
        7,
        expect.any(Object),
      )
    })

    await waitFor(() => {
      expect(api.getCashFlowApi).toHaveBeenCalledTimes(callsBefore + 1)
    })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('menghapus transaksi dan kembali ke dashboard setelah berhasil', async () => {
    mockGetCashFlow()

    const { router } = await renderWithProviders(DetailPage, {
      route: '/cashflows/7',
    })

    expect(
      await screen.findByRole('heading', { name: 'alat-elektronik' }),
    ).toBeInTheDocument()

    vi.mocked(tools.showConfirmDialog).mockResolvedValue(true)

    vi.mocked(api.deleteCashFlowApi).mockResolvedValue(
      ok(null, 'Transaksi berhasil dihapus'),
    )

    await fireEvent.click(screen.getByRole('button', { name: /hapus/i }))

    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/cashflows')
    })

    expect(tools.showSuccessDialog).toHaveBeenCalled()
  })

  it('menampilkan error ketika penghapusan transaksi gagal', async () => {
    mockGetCashFlow()

    vi.mocked(tools.showConfirmDialog).mockResolvedValue(true)

    vi.mocked(api.deleteCashFlowApi).mockRejectedValue(
      new Error('Gagal menghapus transaksi'),
    )

    await renderWithProviders(DetailPage, { route: '/cashflows/7' })

    expect(
      await screen.findByRole('heading', { name: 'alat-elektronik' }),
    ).toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: /hapus/i }))

    await waitFor(() => {
      expect(tools.showErrorDialog).toHaveBeenCalled()
    })
  })

  it('tidak menghapus transaksi ketika konfirmasi dibatalkan', async () => {
    mockGetCashFlow()

    vi.mocked(tools.showConfirmDialog).mockResolvedValue(false)

    await renderWithProviders(DetailPage, { route: '/cashflows/7' })

    expect(
      await screen.findByRole('heading', { name: 'alat-elektronik' }),
    ).toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: /hapus/i }))

    await waitFor(() => {
      expect(tools.showConfirmDialog).toHaveBeenCalled()
    })

    expect(api.deleteCashFlowApi).not.toHaveBeenCalled()
    expect(tools.showSuccessDialog).not.toHaveBeenCalled()
  })
})

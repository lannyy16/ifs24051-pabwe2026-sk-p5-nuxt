import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as tools from '../../../helpers/toolsHelper'
import { renderWithProviders, sampleCashFlow, sampleInflow } from '../../../test-utils'
import * as api from '../api/cashFlowApi'
import DetailPage from './DetailPage.vue'

vi.mock('../api/cashFlowApi')
vi.mock('../../../helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../helpers/toolsHelper')>()),
  showConfirmDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue(undefined),
  showErrorDialog: vi.fn().mockResolvedValue(undefined),
}))

const ok = (data: unknown, message = 'ok') => ({ status: 'success', message, data }) as never
const options = { route: '/cash-flows/7', routes: [{ path: '/cash-flows/:cashFlowId', component: DetailPage }] }

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(tools.showSuccessDialog).mockResolvedValue(undefined)
  vi.mocked(tools.showErrorDialog).mockResolvedValue(undefined)
  vi.mocked(api.getCashFlowApi).mockResolvedValue(ok({ cash_flow: sampleCashFlow }))
})

describe('DetailPage', () => {
  it('menampilkan rincian transaksi pengeluaran', async () => {
    await renderWithProviders(DetailPage, options)
    expect(screen.getByText('Memuat rincian...')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'alat-elektronik' })).toBeInTheDocument()
    expect(api.getCashFlowApi).toHaveBeenCalledWith('7')
    expect(screen.getByText('Pengeluaran')).toHaveClass('bg-rose-100')
    expect(screen.getByText('Tabungan')).toBeInTheDocument()
    expect(screen.getByText('Membeli keyboard')).toBeInTheDocument()
  })

  it('menampilkan badge pemasukan', async () => {
    vi.mocked(api.getCashFlowApi).mockResolvedValue(ok({ cash_flow: sampleInflow }))
    await renderWithProviders(DetailPage, options)
    expect(await screen.findByText('Pemasukan')).toHaveClass('bg-emerald-100')
  })

  it('menampilkan dialog error dan pesan bila transaksi tidak ditemukan', async () => {
    vi.mocked(api.getCashFlowApi).mockRejectedValue(new Error('Tidak ada'))
    await renderWithProviders(DetailPage, options)
    await waitFor(() => expect(tools.showErrorDialog).toHaveBeenCalledWith('Tidak ada'))
    expect(await screen.findByText('Transaksi tidak ditemukan.')).toBeInTheDocument()
  })

  it('mengubah transaksi dan memuat ulang rincian', async () => {
    vi.mocked(api.changeCashFlowApi).mockResolvedValue(ok(null, 'Diubah'))
    await renderWithProviders(DetailPage, options)
    await screen.findByRole('heading', { name: 'alat-elektronik' })
    await fireEvent.click(screen.getByRole('button', { name: /Ubah/ }))
    await fireEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: /Ubah/ }))
    await fireEvent.submit(screen.getByRole('button', { name: 'Simpan perubahan' }))
    await waitFor(() => expect(api.getCashFlowApi).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('menghapus transaksi: batal, gagal, lalu sukses kembali ke beranda', async () => {
    const { router } = await renderWithProviders(DetailPage, options)
    await screen.findByRole('heading', { name: 'alat-elektronik' })

    vi.mocked(tools.showConfirmDialog).mockResolvedValueOnce(false)
    await fireEvent.click(screen.getByRole('button', { name: /Hapus/ }))
    await waitFor(() => expect(tools.showConfirmDialog).toHaveBeenCalledTimes(1))
    expect(api.deleteCashFlowApi).not.toHaveBeenCalled()

    vi.mocked(tools.showConfirmDialog).mockResolvedValueOnce(true)
    vi.mocked(api.deleteCashFlowApi).mockRejectedValueOnce(new Error('gagal hapus'))
    await fireEvent.click(screen.getByRole('button', { name: /Hapus/ }))
    await waitFor(() => expect(tools.showErrorDialog).toHaveBeenCalledWith('gagal hapus'))

    vi.mocked(tools.showConfirmDialog).mockResolvedValueOnce(true)
    vi.mocked(api.deleteCashFlowApi).mockResolvedValueOnce(ok(null, 'Dihapus'))
    await fireEvent.click(screen.getByRole('button', { name: /Hapus/ }))
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/'))
    expect(tools.showSuccessDialog).toHaveBeenCalledWith('Dihapus')
  })
})

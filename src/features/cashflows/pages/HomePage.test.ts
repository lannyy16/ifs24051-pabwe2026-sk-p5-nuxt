import { fireEvent, screen, waitFor, within } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as tools from '../../../helpers/toolsHelper'
import { renderWithProviders, sampleCashFlow, sampleInflow } from '../../../test-utils'
import * as api from '../api/cashFlowApi'
import HomePage from './HomePage.vue'

vi.mock('../api/cashFlowApi')
vi.mock('../../../helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../helpers/toolsHelper')>()),
  showConfirmDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue(undefined),
  showErrorDialog: vi.fn().mockResolvedValue(undefined),
}))

const ok = (data: unknown, message = 'ok') => ({ status: 'success', message, data }) as never
const period = {
  stats_inflow: { '01-10-2024': 100, '02-10-2024': 50 },
  stats_outflow: { '01-10-2024': 20 },
  stats_cashflow: {},
}

function mockApis(cashFlows = [sampleInflow, sampleCashFlow]) {
  vi.mocked(api.getCashFlowsApi).mockResolvedValue(
    ok({
      cash_flows: cashFlows,
      stats: { cashflow: 2000000, total_inflow: 2500000, total_outflow: 500000, total_inflow_cash: 2500000 },
    }),
  )
  vi.mocked(api.getLabelsApi).mockResolvedValue(ok({ labels: ['gaji', 'alat-mandi'] }))
  vi.mocked(api.getDailyStatsApi).mockResolvedValue(ok(period))
  vi.mocked(api.getMonthlyStatsApi).mockResolvedValue(ok(period))
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(tools.showSuccessDialog).mockResolvedValue(undefined)
  vi.mocked(tools.showErrorDialog).mockResolvedValue(undefined)
  mockApis()
})

describe('HomePage', () => {
  it('menampilkan metrik, tabel transaksi, badge, dan statistik periode', async () => {
    await renderWithProviders(HomePage)
    expect(screen.getByText('Memuat data...')).toBeInTheDocument()
    expect(await screen.findAllByTestId('cash-flow-row')).toHaveLength(2)
    expect(screen.getAllByTestId('metric')).toHaveLength(6)
    expect(screen.getByText('Pemasukan')).toHaveClass('bg-emerald-100')
    expect(screen.getByText('Pengeluaran')).toHaveClass('bg-rose-100')
    await waitFor(() => expect(screen.getAllByTestId('period-bars')).toHaveLength(2))
    expect(screen.getAllByRole('link', { name: 'Lihat detail' })[0]).toHaveAttribute('href', '/cash-flows/8')
  })

  it('menampilkan keadaan kosong dan placeholder statistik saat data tidak tersedia', async () => {
    mockApis([])
    vi.mocked(api.getDailyStatsApi).mockRejectedValue(new Error('x'))
    vi.mocked(api.getMonthlyStatsApi).mockRejectedValue(new Error('x'))
    await renderWithProviders(HomePage)
    expect(await screen.findByText('Belum ada transaksi arus kas.')).toBeInTheDocument()
    expect(screen.getAllByText('Belum ada data statistik.')).toHaveLength(2)
  })

  it('menerapkan dan mereset filter', async () => {
    await renderWithProviders(HomePage)
    await screen.findAllByTestId('cash-flow-row')
    await fireEvent.update(screen.getByLabelText('Filter jenis'), 'inflow')
    await fireEvent.update(screen.getByLabelText('Filter sumber'), 'cash')
    await fireEvent.update(screen.getByLabelText('Filter label'), 'gaji')
    await fireEvent.update(screen.getByLabelText('Tanggal awal'), '2024-10-01')
    await fireEvent.update(screen.getByLabelText('Tanggal akhir'), '2024-10-31')
    await fireEvent.click(screen.getByRole('button', { name: 'Terapkan' }))
    await waitFor(() =>
      expect(api.getCashFlowsApi).toHaveBeenLastCalledWith({
        type: 'inflow',
        source: 'cash',
        label: 'gaji',
        start_date: '2024-10-01 00:00:00',
        end_date: '2024-10-31 23:59:59',
      }),
    )
    await fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    await waitFor(() => expect(api.getCashFlowsApi).toHaveBeenLastCalledWith({}))
    expect((screen.getByLabelText('Filter jenis') as HTMLSelectElement).value).toBe('')
  })

  it('menambah transaksi lewat modal lalu memuat ulang data', async () => {
    vi.mocked(api.addCashFlowApi).mockResolvedValue(ok({ cash_flow_id: 1 }, 'Ditambah'))
    await renderWithProviders(HomePage)
    await screen.findAllByTestId('cash-flow-row')
    await fireEvent.click(screen.getByRole('button', { name: /Tambah Transaksi/ }))
    const dialog = screen.getByRole('dialog', { name: 'Tambah transaksi' })
    await fireEvent.click(within(dialog).getByRole('button', { name: 'Batal' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: /Tambah Transaksi/ }))
    const callsBefore = vi.mocked(api.getCashFlowsApi).mock.calls.length
    await fireEvent.update(screen.getByLabelText('Label kategori'), 'makan')
    await fireEvent.update(screen.getByLabelText('Nominal (Rp)'), '1000')
    await fireEvent.update(screen.getByLabelText('Keterangan'), 'x')
    await fireEvent.submit(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(vi.mocked(api.getCashFlowsApi).mock.calls.length).toBeGreaterThan(callsBefore))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('mengubah transaksi lewat modal', async () => {
    vi.mocked(api.changeCashFlowApi).mockResolvedValue(ok(null, 'Diubah'))
    await renderWithProviders(HomePage)
    await screen.findAllByTestId('cash-flow-row')
    await fireEvent.click(screen.getAllByLabelText('Ubah')[0])
    const dialog = screen.getByRole('dialog', { name: 'Ubah transaksi' })
    await fireEvent.click(within(dialog).getByRole('button', { name: 'Batal' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await fireEvent.click(screen.getAllByLabelText('Ubah')[1])
    await fireEvent.submit(screen.getByRole('button', { name: 'Simpan perubahan' }))
    await waitFor(() => expect(api.changeCashFlowApi).toHaveBeenCalledWith(7, expect.any(Object)))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('menghapus satu transaksi: batal, sukses, dan gagal', async () => {
    vi.mocked(api.deleteCashFlowApi).mockResolvedValueOnce(ok(null, 'Dihapus'))
    await renderWithProviders(HomePage)
    await screen.findAllByTestId('cash-flow-row')

    vi.mocked(tools.showConfirmDialog).mockResolvedValueOnce(false)
    await fireEvent.click(screen.getAllByLabelText('Hapus')[0])
    await waitFor(() => expect(tools.showConfirmDialog).toHaveBeenCalledTimes(1))
    expect(api.deleteCashFlowApi).not.toHaveBeenCalled()

    vi.mocked(tools.showConfirmDialog).mockResolvedValueOnce(true)
    await fireEvent.click(screen.getAllByLabelText('Hapus')[0])
    await waitFor(() => expect(tools.showSuccessDialog).toHaveBeenCalledWith('Dihapus'))
    expect(api.deleteCashFlowApi).toHaveBeenCalledWith(8)

    vi.mocked(tools.showConfirmDialog).mockResolvedValueOnce(true)
    vi.mocked(api.deleteCashFlowApi).mockRejectedValueOnce(new Error('gagal hapus'))
    await fireEvent.click(screen.getAllByLabelText('Hapus')[0])
    await waitFor(() => expect(tools.showErrorDialog).toHaveBeenCalledWith('gagal hapus'))
  })

  it('mereset seluruh transaksi: batal, sukses, dan gagal', async () => {
    vi.mocked(api.deleteAllCashFlowsApi).mockResolvedValueOnce(ok(null, 'Semua dihapus'))
    await renderWithProviders(HomePage)
    await screen.findAllByTestId('cash-flow-row')

    vi.mocked(tools.showConfirmDialog).mockResolvedValueOnce(false)
    await fireEvent.click(screen.getByRole('button', { name: /Reset Semua/ }))
    await waitFor(() => expect(tools.showConfirmDialog).toHaveBeenCalledTimes(1))
    expect(api.deleteAllCashFlowsApi).not.toHaveBeenCalled()

    vi.mocked(tools.showConfirmDialog).mockResolvedValueOnce(true)
    await fireEvent.click(screen.getByRole('button', { name: /Reset Semua/ }))
    await waitFor(() => expect(tools.showSuccessDialog).toHaveBeenCalledWith('Semua dihapus'))

    vi.mocked(tools.showConfirmDialog).mockResolvedValueOnce(true)
    vi.mocked(api.deleteAllCashFlowsApi).mockRejectedValueOnce(new Error('gagal reset'))
    await fireEvent.click(screen.getByRole('button', { name: /Reset Semua/ }))
    await waitFor(() => expect(tools.showErrorDialog).toHaveBeenCalledWith('gagal reset'))
  })
})

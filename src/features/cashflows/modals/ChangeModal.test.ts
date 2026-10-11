import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as tools from '../../../helpers/toolsHelper'
import { renderWithProviders, sampleCashFlow } from '../../../test-utils'
import { changeCashFlowApi } from '../api/cashFlowApi'
import ChangeModal from './ChangeModal.vue'

vi.mock('../api/cashFlowApi')
vi.mock('../../../helpers/toolsHelper', () => ({
  showSuccessDialog: vi.fn().mockResolvedValue(undefined),
  showErrorDialog: vi.fn().mockResolvedValue(undefined),
}))

beforeEach(() => vi.clearAllMocks())

describe('ChangeModal', () => {
  it('tidak merender apa pun saat tertutup', async () => {
    await renderWithProviders(ChangeModal, { props: { open: false, cashFlow: null } })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('mengisi form dari transaksi dan menyimpan perubahan', async () => {
    vi.mocked(changeCashFlowApi).mockResolvedValue({ status: 'success', message: 'Diubah', data: null })
    const { emitted, rerender } = await renderWithProviders(ChangeModal, { props: { open: true, cashFlow: sampleCashFlow } })
    expect((screen.getByLabelText('Label kategori') as HTMLInputElement).value).toBe('alat-elektronik')
    await rerender({ open: true, cashFlow: { ...sampleCashFlow, label: 'baru' } })
    await fireEvent.update(screen.getByLabelText('Jenis'), 'inflow')
    await fireEvent.update(screen.getByLabelText('Sumber dana'), 'loans')
    await fireEvent.update(screen.getByLabelText('Label kategori'), 'baru')
    await fireEvent.update(screen.getByLabelText('Keterangan'), 'Catatan baru')
    await fireEvent.update(screen.getByLabelText('Nominal (Rp)'), '500000')
    await fireEvent.submit(screen.getByRole('button', { name: 'Simpan perubahan' }))
    await waitFor(() => expect(emitted()).toHaveProperty('saved'))
    expect(changeCashFlowApi).toHaveBeenCalledWith(7, expect.objectContaining({ type: 'inflow', source: 'loans', label: 'baru', description: 'Catatan baru', nominal: 500000 }))
    expect(tools.showSuccessDialog).toHaveBeenCalledWith('Diubah')
  })

  it('menampilkan dialog error saat gagal', async () => {
    vi.mocked(changeCashFlowApi).mockRejectedValue(new Error('invalid'))
    await renderWithProviders(ChangeModal, { props: { open: true, cashFlow: sampleCashFlow } })
    await fireEvent.submit(screen.getByRole('button', { name: 'Simpan perubahan' }))
    await waitFor(() => expect(tools.showErrorDialog).toHaveBeenCalledWith('invalid'))
  })

  it('tidak mengirim apa pun bila tidak ada transaksi', async () => {
    await renderWithProviders(ChangeModal, { props: { open: true, cashFlow: null } })
    await fireEvent.submit(screen.getByRole('button', { name: 'Simpan perubahan' }))
    expect(changeCashFlowApi).not.toHaveBeenCalled()
  })

  it('emit close dan menampilkan status menyimpan', async () => {
    const { emitted } = await renderWithProviders(ChangeModal, {
      props: { open: true, cashFlow: sampleCashFlow },
      initialState: { cashFlows: { isCashFlowChange: true } },
    })
    expect(screen.getByRole('button', { name: 'Menyimpan...' })).toBeDisabled()
    await fireEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(emitted()).toHaveProperty('close')
  })
})

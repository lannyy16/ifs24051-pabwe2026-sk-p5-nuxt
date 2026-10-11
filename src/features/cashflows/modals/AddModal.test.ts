import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as tools from '../../../helpers/toolsHelper'
import { renderWithProviders } from '../../../test-utils'
import { addCashFlowApi } from '../api/cashFlowApi'
import AddModal from './AddModal.vue'

vi.mock('../api/cashFlowApi')
vi.mock('../../../helpers/toolsHelper', () => ({
  showSuccessDialog: vi.fn().mockResolvedValue(undefined),
  showErrorDialog: vi.fn().mockResolvedValue(undefined),
}))

async function fillAndSubmit() {
  await fireEvent.update(screen.getByLabelText('Jenis'), 'outflow')
  await fireEvent.update(screen.getByLabelText('Sumber dana'), 'savings')
  await fireEvent.update(screen.getByLabelText('Label kategori'), 'makan')
  await fireEvent.update(screen.getByLabelText('Nominal (Rp)'), '25000')
  await fireEvent.update(screen.getByLabelText('Keterangan'), 'Makan siang')
  await fireEvent.submit(screen.getByRole('button', { name: 'Simpan' }))
}

beforeEach(() => vi.clearAllMocks())

describe('AddModal', () => {
  it('tidak merender apa pun saat tertutup', async () => {
    await renderWithProviders(AddModal, { props: { open: false } })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('menyimpan transaksi baru lalu emit saved', async () => {
    vi.mocked(addCashFlowApi).mockResolvedValue({ status: 'success', message: 'Ditambah', data: { cash_flow_id: 1 } })
    const { emitted } = await renderWithProviders(AddModal, {
      props: { open: true },
      initialState: { cashFlows: { labels: ['gaji'] } },
    })
    await fillAndSubmit()
    await waitFor(() => expect(emitted()).toHaveProperty('saved'))
    expect(addCashFlowApi).toHaveBeenCalledWith({
      type: 'outflow',
      source: 'savings',
      label: 'makan',
      nominal: 25000,
      description: 'Makan siang',
    })
    expect(tools.showSuccessDialog).toHaveBeenCalledWith('Ditambah')
    expect((screen.getByLabelText('Label kategori') as HTMLInputElement).value).toBe('')
  })

  it('menampilkan dialog error saat gagal', async () => {
    vi.mocked(addCashFlowApi).mockRejectedValue(new Error('invalid'))
    const { emitted } = await renderWithProviders(AddModal, { props: { open: true } })
    await fillAndSubmit()
    await waitFor(() => expect(tools.showErrorDialog).toHaveBeenCalledWith('invalid'))
    expect(emitted()).not.toHaveProperty('saved')
  })

  it('emit close saat Batal dan menampilkan status menyimpan', async () => {
    const { emitted } = await renderWithProviders(AddModal, {
      props: { open: true },
      initialState: { cashFlows: { isCashFlowAdd: true } },
    })
    expect(screen.getByRole('button', { name: 'Menyimpan...' })).toBeDisabled()
    await fireEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(emitted()).toHaveProperty('close')
  })
})

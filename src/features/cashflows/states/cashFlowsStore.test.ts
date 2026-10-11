import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sampleCashFlow } from '../../../test-utils'
import * as api from '../api/cashFlowApi'
import { mapStats, useCashFlowsStore } from './cashFlowsStore'

vi.mock('../api/cashFlowApi')

const ok = (data: unknown, message = 'ok') => ({ status: 'success', message, data })
const payload = { type: 'inflow', source: 'cash', label: 'gaji', nominal: 1, description: 'x' } as const

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetAllMocks()
})

describe('mapStats', () => {
  it('menghitung saldo per sumber dana', () => {
    expect(
      mapStats({
        cashflow: 2000000,
        total_inflow: 2500000,
        total_outflow: 500000,
        total_inflow_cash: 2500000,
        total_outflow_cash: 100000,
        total_outflow_savings: 400000,
        total_inflow_loans: 50,
      }),
    ).toEqual({ cashflow: 2000000, totalInflow: 2500000, totalOutflow: 500000, cash: 2400000, savings: -400000, loans: 50 })
  })

  it('bernilai nol bila statistik kosong', () => {
    expect(mapStats({})).toEqual({ cashflow: 0, totalInflow: 0, totalOutflow: 0, cash: 0, savings: 0, loans: 0 })
  })
})

describe('useCashFlowsStore', () => {
  it('fetchCashFlows sukses (dengan & tanpa parameter) dan gagal', async () => {
    const store = useCashFlowsStore()
    vi.mocked(api.getCashFlowsApi).mockResolvedValueOnce(ok({ cash_flows: [sampleCashFlow], stats: { total_inflow: 9 } }) as never)
    expect(await store.fetchCashFlows()).toBe(true)
    expect(api.getCashFlowsApi).toHaveBeenLastCalledWith({})
    expect(store.cashFlows).toEqual([sampleCashFlow])
    expect(store.stats.totalInflow).toBe(9)
    vi.mocked(api.getCashFlowsApi).mockResolvedValueOnce(ok({ cash_flows: [], stats: {} }) as never)
    await store.fetchCashFlows({ type: 'inflow' })
    expect(api.getCashFlowsApi).toHaveBeenLastCalledWith({ type: 'inflow' })
    vi.mocked(api.getCashFlowsApi).mockRejectedValueOnce(new Error('gagal'))
    expect(await store.fetchCashFlows()).toBe(false)
    expect(store.message).toBe('gagal')
    expect(store.isLoading).toBe(false)
  })

  it('fetchCashFlow sukses dan gagal', async () => {
    const store = useCashFlowsStore()
    vi.mocked(api.getCashFlowApi).mockResolvedValueOnce(ok({ cash_flow: sampleCashFlow }) as never)
    expect(await store.fetchCashFlow(7)).toBe(true)
    expect(store.cashFlow).toEqual(sampleCashFlow)
    vi.mocked(api.getCashFlowApi).mockRejectedValueOnce(new Error('404'))
    expect(await store.fetchCashFlow(7)).toBe(false)
    expect(store.cashFlow).toBeNull()
    expect(store.message).toBe('404')
  })

  it('addCashFlow melacak status tambah', async () => {
    const store = useCashFlowsStore()
    vi.mocked(api.addCashFlowApi).mockResolvedValueOnce(ok({ cash_flow_id: 1 }, 'Ditambah') as never)
    expect(await store.addCashFlow(payload)).toBe(true)
    expect(store.isCashFlowAdded).toBe(true)
    expect(store.isCashFlowAdd).toBe(false)
    expect(store.message).toBe('Ditambah')
    vi.mocked(api.addCashFlowApi).mockRejectedValueOnce(new Error('invalid'))
    expect(await store.addCashFlow(payload)).toBe(false)
    expect(store.isCashFlowAdded).toBe(false)
    expect(store.message).toBe('invalid')
  })

  it('changeCashFlow melacak status ubah', async () => {
    const store = useCashFlowsStore()
    vi.mocked(api.changeCashFlowApi).mockResolvedValueOnce(ok(null, 'Diubah') as never)
    expect(await store.changeCashFlow(1, payload)).toBe(true)
    expect(store.isCashFlowChanged).toBe(true)
    expect(store.isCashFlowChange).toBe(false)
    vi.mocked(api.changeCashFlowApi).mockRejectedValueOnce(new Error('invalid'))
    expect(await store.changeCashFlow(1, payload)).toBe(false)
    expect(store.isCashFlowChanged).toBe(false)
    expect(store.message).toBe('invalid')
  })

  it('deleteCashFlow melacak status hapus', async () => {
    const store = useCashFlowsStore()
    vi.mocked(api.deleteCashFlowApi).mockResolvedValueOnce(ok(null, 'Dihapus') as never)
    expect(await store.deleteCashFlow(1)).toBe(true)
    expect(store.isCashFlowDeleted).toBe(true)
    expect(store.isCashFlowDelete).toBe(false)
    vi.mocked(api.deleteCashFlowApi).mockRejectedValueOnce(new Error('gagal'))
    expect(await store.deleteCashFlow(1)).toBe(false)
    expect(store.isCashFlowDeleted).toBe(false)
  })

  it('deleteAllCashFlows melacak status reset', async () => {
    const store = useCashFlowsStore()
    vi.mocked(api.deleteAllCashFlowsApi).mockResolvedValueOnce(ok(null, 'Semua dihapus') as never)
    expect(await store.deleteAllCashFlows()).toBe(true)
    expect(store.isCashFlowDeletedAll).toBe(true)
    expect(store.isCashFlowDeleteAll).toBe(false)
    vi.mocked(api.deleteAllCashFlowsApi).mockRejectedValueOnce(new Error('gagal'))
    expect(await store.deleteAllCashFlows()).toBe(false)
    expect(store.isCashFlowDeletedAll).toBe(false)
  })

  it('fetchLabels sukses dan gagal', async () => {
    const store = useCashFlowsStore()
    vi.mocked(api.getLabelsApi).mockResolvedValueOnce(ok({ labels: ['gaji'] }) as never)
    expect(await store.fetchLabels()).toBe(true)
    expect(store.labels).toEqual(['gaji'])
    vi.mocked(api.getLabelsApi).mockRejectedValueOnce(new Error('gagal'))
    expect(await store.fetchLabels()).toBe(false)
  })

  it('fetchDailyStats dan fetchMonthlyStats sukses dan gagal', async () => {
    const store = useCashFlowsStore()
    const stats = { stats_inflow: { a: 1 }, stats_outflow: { a: 2 }, stats_cashflow: { a: -1 } }
    vi.mocked(api.getDailyStatsApi).mockResolvedValueOnce(ok(stats) as never)
    vi.mocked(api.getMonthlyStatsApi).mockResolvedValueOnce(ok(stats) as never)
    expect(await store.fetchDailyStats()).toBe(true)
    expect(await store.fetchMonthlyStats()).toBe(true)
    expect(store.dailyStats).toEqual(stats)
    expect(store.monthlyStats).toEqual(stats)
    vi.mocked(api.getDailyStatsApi).mockRejectedValueOnce(new Error('d'))
    vi.mocked(api.getMonthlyStatsApi).mockRejectedValueOnce(new Error('m'))
    expect(await store.fetchDailyStats()).toBe(false)
    expect(await store.fetchMonthlyStats()).toBe(false)
    expect(store.message).toBe('m')
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../helpers/apiHelper'
import {
  addCashFlowApi,
  changeCashFlowApi,
  deleteAllCashFlowsApi,
  deleteCashFlowApi,
  getCashFlowApi,
  getCashFlowsApi,
  getDailyStatsApi,
  getLabelsApi,
  getMonthlyStatsApi,
} from './cashFlowApi'

vi.mock('../../../helpers/apiHelper')

const payload = { type: 'inflow', source: 'cash', label: 'gaji', nominal: 1, description: 'x' } as const

beforeEach(() => vi.mocked(apiRequest).mockReset())

describe('cashFlowApi', () => {
  it('GET /cash-flows dengan dan tanpa filter', async () => {
    await getCashFlowsApi({ type: 'inflow', source: 'cash', label: 'gaji', start_date: 'a', end_date: 'b' })
    expect(apiRequest).toHaveBeenLastCalledWith('/cash-flows', {
      query: { type: 'inflow', source: 'cash', label: 'gaji', start_date: 'a', end_date: 'b' },
    })
    await getCashFlowsApi()
    expect(apiRequest).toHaveBeenLastCalledWith('/cash-flows', { query: {} })
  })

  it('GET detail /cash-flows/:id', async () => {
    await getCashFlowApi(5)
    expect(apiRequest).toHaveBeenCalledWith('/cash-flows/5')
  })

  it('POST tambah dan PUT ubah', async () => {
    await addCashFlowApi(payload)
    expect(apiRequest).toHaveBeenLastCalledWith('/cash-flows', { method: 'POST', body: payload })
    await changeCashFlowApi(5, payload)
    expect(apiRequest).toHaveBeenLastCalledWith('/cash-flows/5', { method: 'PUT', body: payload })
  })

  it('DELETE satu dan semua', async () => {
    await deleteCashFlowApi(5)
    expect(apiRequest).toHaveBeenLastCalledWith('/cash-flows/5', { method: 'DELETE' })
    await deleteAllCashFlowsApi()
    expect(apiRequest).toHaveBeenLastCalledWith('/cash-flows', { method: 'DELETE' })
  })

  it('GET labels dan statistik harian/bulanan', async () => {
    await getLabelsApi()
    expect(apiRequest).toHaveBeenLastCalledWith('/cash-flows/labels')
    await getDailyStatsApi({ total_data: 7 })
    expect(apiRequest).toHaveBeenLastCalledWith('/cash-flows/stats/daily', { query: { total_data: 7 } })
    await getDailyStatsApi()
    expect(apiRequest).toHaveBeenLastCalledWith('/cash-flows/stats/daily', { query: {} })
    await getMonthlyStatsApi({ total_data: 6 })
    expect(apiRequest).toHaveBeenLastCalledWith('/cash-flows/stats/monthly', { query: { total_data: 6 } })
    await getMonthlyStatsApi()
    expect(apiRequest).toHaveBeenLastCalledWith('/cash-flows/stats/monthly', { query: {} })
  })
})

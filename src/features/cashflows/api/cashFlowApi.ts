import { apiRequest } from '../../../helpers/apiHelper'

export type CashFlowType = 'inflow' | 'outflow'
export type CashFlowSource = 'cash' | 'savings' | 'loans'

export interface CashFlow {
  id: number
  user_id: number
  type: CashFlowType
  source: CashFlowSource
  label: string
  description: string
  nominal: number
  created_at: string
  updated_at: string
}

export interface CashFlowPayload {
  type: CashFlowType
  source: CashFlowSource
  label: string
  nominal: number
  description: string
}

export interface CashFlowQueryParams {
  type?: CashFlowType | ''
  source?: CashFlowSource | ''
  label?: string
  start_date?: string
  end_date?: string
}

/** Statistik mentah dari API (kunci dinamis: total_inflow_cash, total_outflow_savings, dst). */
export type RawCashFlowStats = Record<string, number>

export type PeriodStats = Record<string, number>

export interface PeriodStatsData {
  stats_inflow: PeriodStats
  stats_outflow: PeriodStats
  stats_cashflow: PeriodStats
}

export const getCashFlowsApi = (query: CashFlowQueryParams = {}) =>
  apiRequest<{ cash_flows: CashFlow[]; stats: RawCashFlowStats }>('/cash-flows', { query: { ...query } })

export const getCashFlowApi = (id: number | string) => apiRequest<{ cash_flow: CashFlow }>(`/cash-flows/${id}`)

export const addCashFlowApi = (payload: CashFlowPayload) =>
  apiRequest<{ cash_flow_id: number }>('/cash-flows', { method: 'POST', body: payload })

export const changeCashFlowApi = (id: number | string, payload: CashFlowPayload) =>
  apiRequest(`/cash-flows/${id}`, { method: 'PUT', body: payload })

export const deleteCashFlowApi = (id: number | string) => apiRequest(`/cash-flows/${id}`, { method: 'DELETE' })

export const getLabelsApi = () => apiRequest<{ labels: string[] }>('/cash-flows/labels')

export const getDailyStatsApi = (query: { end_date?: string; total_data?: number } = {}) =>
  apiRequest<PeriodStatsData>('/cash-flows/stats/daily', { query })

export const getMonthlyStatsApi = (query: { end_date?: string; total_data?: number } = {}) =>
  apiRequest<PeriodStatsData>('/cash-flows/stats/monthly', { query })

export const deleteAllCashFlowsApi = () => apiRequest('/cash-flows', { method: 'DELETE' })

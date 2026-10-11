import { defineStore } from 'pinia'
import { getErrorMessage } from '../../../helpers/apiHelper'
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
} from '../api/cashFlowApi'
import type {
  CashFlow,
  CashFlowPayload,
  CashFlowQueryParams,
  PeriodStatsData,
  RawCashFlowStats,
} from '../api/cashFlowApi'

export type { CashFlow, CashFlowQueryParams }

export interface CashFlowStats {
  cashflow: number
  totalInflow: number
  totalOutflow: number
  cash: number
  savings: number
  loans: number
}

export interface CashFlowsState {
  cashFlows: CashFlow[]
  cashFlow: CashFlow | null
  stats: CashFlowStats
  labels: string[]
  dailyStats: PeriodStatsData | null
  monthlyStats: PeriodStatsData | null
  isLoading: boolean
  isCashFlowAdd: boolean
  isCashFlowAdded: boolean
  isCashFlowChange: boolean
  isCashFlowChanged: boolean
  isCashFlowDelete: boolean
  isCashFlowDeleted: boolean
  isCashFlowDeleteAll: boolean
  isCashFlowDeletedAll: boolean
  message: string
}

const emptyStats = (): CashFlowStats => ({
  cashflow: 0,
  totalInflow: 0,
  totalOutflow: 0,
  cash: 0,
  savings: 0,
  loans: 0,
})

/** Petakan statistik mentah API menjadi ringkasan saldo per sumber dana. */
export function mapStats(raw: RawCashFlowStats): CashFlowStats {
  const value = (key: string) => raw[key] ?? 0
  const balance = (source: string) => value(`total_inflow_${source}`) - value(`total_outflow_${source}`)
  return {
    cashflow: value('cashflow'),
    totalInflow: value('total_inflow'),
    totalOutflow: value('total_outflow'),
    cash: balance('cash'),
    savings: balance('savings'),
    loans: balance('loans'),
  }
}

export const useCashFlowsStore = defineStore('cashFlows', {
  state: (): CashFlowsState => ({
    cashFlows: [],
    cashFlow: null,
    stats: emptyStats(),
    labels: [],
    dailyStats: null,
    monthlyStats: null,
    isLoading: false,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
    message: '',
  }),
  actions: {
    async fetchCashFlows(params: CashFlowQueryParams = {}): Promise<boolean> {
      this.isLoading = true
      try {
        const { data } = await getCashFlowsApi(params)
        this.cashFlows = data.cash_flows
        this.stats = mapStats(data.stats)
        return true
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    async fetchCashFlow(id: number | string): Promise<boolean> {
      this.isLoading = true
      this.cashFlow = null
      try {
        const { data } = await getCashFlowApi(id)
        this.cashFlow = data.cash_flow
        return true
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    async addCashFlow(payload: CashFlowPayload): Promise<boolean> {
      this.isCashFlowAdd = true
      this.isCashFlowAdded = false
      try {
        const { message } = await addCashFlowApi(payload)
        this.message = message
        this.isCashFlowAdded = true
        return true
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      } finally {
        this.isCashFlowAdd = false
      }
    },
    async changeCashFlow(id: number | string, payload: CashFlowPayload): Promise<boolean> {
      this.isCashFlowChange = true
      this.isCashFlowChanged = false
      try {
        const { message } = await changeCashFlowApi(id, payload)
        this.message = message
        this.isCashFlowChanged = true
        return true
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      } finally {
        this.isCashFlowChange = false
      }
    },
    async deleteCashFlow(id: number | string): Promise<boolean> {
      this.isCashFlowDelete = true
      this.isCashFlowDeleted = false
      try {
        const { message } = await deleteCashFlowApi(id)
        this.message = message
        this.isCashFlowDeleted = true
        return true
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      } finally {
        this.isCashFlowDelete = false
      }
    },
    async deleteAllCashFlows(): Promise<boolean> {
      this.isCashFlowDeleteAll = true
      this.isCashFlowDeletedAll = false
      try {
        const { message } = await deleteAllCashFlowsApi()
        this.message = message
        this.isCashFlowDeletedAll = true
        return true
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      } finally {
        this.isCashFlowDeleteAll = false
      }
    },
    async fetchLabels(): Promise<boolean> {
      try {
        const { data } = await getLabelsApi()
        this.labels = data.labels
        return true
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      }
    },
    async fetchDailyStats(): Promise<boolean> {
      try {
        const { data } = await getDailyStatsApi()
        this.dailyStats = data
        return true
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      }
    },
    async fetchMonthlyStats(): Promise<boolean> {
      try {
        const { data } = await getMonthlyStatsApi()
        this.monthlyStats = data
        return true
      } catch (error) {
        this.message = getErrorMessage(error)
        return false
      }
    },
  },
})

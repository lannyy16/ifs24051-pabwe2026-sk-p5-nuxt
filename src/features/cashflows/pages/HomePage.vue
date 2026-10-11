<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import {
  SOURCE_LABELS,
  TYPE_LABELS,
  formatDateTime,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  toApiDate,
} from '../../../helpers/toolsHelper'
import { useInput } from '../../../hooks/useInput'
import AddModal from '../modals/AddModal.vue'
import ChangeModal from '../modals/ChangeModal.vue'
import { useCashFlowsStore } from '../states/cashFlowsStore'
import type { CashFlow, CashFlowQueryParams } from '../states/cashFlowsStore'

const store = useCashFlowsStore()
const { form, reset } = useInput({ type: '', source: '', label: '', start_date: '', end_date: '' })

const showAdd = ref(false)
const editing = ref<CashFlow | null>(null)

const metrics = computed(() => [
  { title: 'Total Saldo Kas Bersih', value: store.stats.cashflow, tone: 'text-brand-700' },
  { title: 'Total Pemasukan (Inflow)', value: store.stats.totalInflow, tone: 'text-emerald-600' },
  { title: 'Total Pengeluaran (Outflow)', value: store.stats.totalOutflow, tone: 'text-rose-600' },
  { title: 'Saldo Kas Tunai', value: store.stats.cash, tone: 'text-slate-800' },
  { title: 'Saldo Rekening Tabungan', value: store.stats.savings, tone: 'text-slate-800' },
  { title: 'Saldo Pinjaman', value: store.stats.loans, tone: 'text-slate-800' },
])

const periods = computed(() => [
  { title: 'Tren Harian', data: store.dailyStats },
  { title: 'Tren Bulanan', data: store.monthlyStats },
])

function bars(data: { stats_inflow: Record<string, number>; stats_outflow: Record<string, number> }) {
  const inflow = data.stats_inflow
  const outflow = data.stats_outflow
  const keys = Object.keys(inflow)
  const max = Math.max(1, ...keys.map((k) => Math.max(inflow[k], outflow[k] ?? 0)))
  return keys.map((key) => ({
    key,
    inflow: (inflow[key] / max) * 100,
    outflow: ((outflow[key] ?? 0) / max) * 100,
  }))
}

function currentQuery(): CashFlowQueryParams {
  return {
    type: form.type as CashFlowQueryParams['type'],
    source: form.source as CashFlowQueryParams['source'],
    label: form.label,
    start_date: toApiDate(form.start_date, false),
    end_date: toApiDate(form.end_date, true),
  }
}

const applyFilters = () => store.fetchCashFlows(currentQuery())

async function refresh() {
  await Promise.all([
    store.fetchCashFlows(currentQuery()),
    store.fetchLabels(),
    store.fetchDailyStats(),
    store.fetchMonthlyStats(),
  ])
}

async function resetFilters() {
  reset()
  await store.fetchCashFlows()
}

async function onSaved() {
  showAdd.value = false
  editing.value = null
  await refresh()
}

async function removeOne(item: CashFlow) {
  if (!(await showConfirmDialog('Hapus transaksi?', `Transaksi "${item.label}" akan dihapus permanen.`))) return
  if (!(await store.deleteCashFlow(item.id))) {
    await showErrorDialog(store.message)
    return
  }
  await showSuccessDialog(store.message)
  await refresh()
}

async function removeAll() {
  if (!(await showConfirmDialog('Reset semua transaksi?', 'Seluruh catatan arus kas milikmu akan dihapus permanen.'))) return
  if (!(await store.deleteAllCashFlows())) {
    await showErrorDialog(store.message)
    return
  }
  await showSuccessDialog(store.message)
  await refresh()
}

onMounted(refresh)
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-extrabold">Ringkasan Arus Kas</h1>
        <p class="text-sm text-slate-500">Pantau pemasukan, pengeluaran, dan saldo di satu tempat.</p>
      </div>
      <div class="flex gap-2">
        <button type="button" class="btn-primary" @click="showAdd = true"><Plus class="h-4 w-4" /> Tambah Transaksi</button>
        <button type="button" class="btn-danger" :disabled="store.isCashFlowDeleteAll" @click="removeAll">
          <Trash2 class="h-4 w-4" /> Reset Semua
        </button>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="metric in metrics" :key="metric.title" class="card" data-testid="metric">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ metric.title }}</p>
        <p class="mt-1 text-2xl font-extrabold" :class="metric.tone">{{ formatRupiah(metric.value) }}</p>
      </div>
    </div>

    <form class="card grid gap-3 sm:grid-cols-2 lg:grid-cols-6" @submit.prevent="applyFilters">
      <select v-model="form.type" aria-label="Filter jenis" class="input">
        <option value="">Semua jenis</option>
        <option value="inflow">Inflow</option>
        <option value="outflow">Outflow</option>
      </select>
      <select v-model="form.source" aria-label="Filter sumber" class="input">
        <option value="">Semua sumber</option>
        <option value="cash">Tunai</option>
        <option value="savings">Tabungan</option>
        <option value="loans">Pinjaman</option>
      </select>
      <select v-model="form.label" aria-label="Filter label" class="input">
        <option value="">Semua label</option>
        <option v-for="label in store.labels" :key="label" :value="label">{{ label }}</option>
      </select>
      <input v-model="form.start_date" type="date" aria-label="Tanggal awal" class="input" />
      <input v-model="form.end_date" type="date" aria-label="Tanggal akhir" class="input" />
      <div class="flex gap-2">
        <button type="submit" class="btn-primary flex-1">Terapkan</button>
        <button type="button" class="btn-ghost" @click="resetFilters">Reset</button>
      </div>
    </form>

    <div class="card overflow-x-auto p-0">
      <p v-if="store.isLoading" class="p-6 text-center text-slate-500">Memuat data...</p>
      <p v-else-if="store.cashFlows.length === 0" class="p-6 text-center text-slate-500">Belum ada transaksi arus kas.</p>
      <table v-else class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th class="px-4 py-3">Label</th>
            <th class="px-4 py-3">Jenis</th>
            <th class="px-4 py-3">Sumber</th>
            <th class="px-4 py-3 text-right">Nominal</th>
            <th class="px-4 py-3">Tanggal</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in store.cashFlows" :key="item.id" data-testid="cash-flow-row">
            <td class="px-4 py-3 font-semibold">{{ item.label }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="item.type === 'inflow' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
              >
                {{ TYPE_LABELS[item.type] }}
              </span>
            </td>
            <td class="px-4 py-3">{{ SOURCE_LABELS[item.source] }}</td>
            <td class="px-4 py-3 text-right font-semibold">{{ formatRupiah(item.nominal) }}</td>
            <td class="px-4 py-3 text-slate-500">{{ formatDateTime(item.created_at) }}</td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-1.5">
                <RouterLink :to="`/cash-flows/${item.id}`" class="btn-ghost !px-2.5 !py-1.5" aria-label="Lihat detail"><Eye class="h-4 w-4" /></RouterLink>
                <button type="button" class="btn-ghost !px-2.5 !py-1.5" aria-label="Ubah" @click="editing = item"><Pencil class="h-4 w-4" /></button>
                <button type="button" class="btn-ghost !px-2.5 !py-1.5 text-rose-600" aria-label="Hapus" @click="removeOne(item)"><Trash2 class="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div v-for="period in periods" :key="period.title" class="card">
        <h2 class="mb-3 text-sm font-bold">{{ period.title }}</h2>
        <p v-if="!period.data" class="text-sm text-slate-400">Belum ada data statistik.</p>
        <div v-else class="flex h-32 items-end gap-1" data-testid="period-bars">
          <div v-for="bar in bars(period.data)" :key="bar.key" class="flex h-full flex-1 items-end gap-0.5" :title="bar.key">
            <div class="w-1/2 rounded-t bg-emerald-400" :style="{ height: `${bar.inflow}%` }" />
            <div class="w-1/2 rounded-t bg-rose-400" :style="{ height: `${bar.outflow}%` }" />
          </div>
        </div>
      </div>
    </div>

    <AddModal :open="showAdd" @close="showAdd = false" @saved="onSaved" />
    <ChangeModal :open="!!editing" :cash-flow="editing" @close="editing = null" @saved="onSaved" />
  </section>
</template>

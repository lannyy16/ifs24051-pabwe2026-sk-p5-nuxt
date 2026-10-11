<script setup lang="ts">
import { watch } from 'vue'
import { useCashFlowsStore } from '../states/cashFlowsStore'
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'
import { useInput } from '../../../hooks/useInput'
import type { CashFlow, CashFlowSource, CashFlowType } from '../api/cashFlowApi'

const props = defineProps<{ open: boolean; cashFlow: CashFlow | null }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const store = useCashFlowsStore()
const { form, setForm } = useInput({
  type: 'inflow' as CashFlowType,
  source: 'cash' as CashFlowSource,
  label: '',
  nominal: 0,
  description: '',
})

watch(
  () => props.cashFlow,
  (value) => {
    if (value) {
      setForm({
        type: value.type,
        source: value.source,
        label: value.label,
        nominal: value.nominal,
        description: value.description,
      })
    }
  },
  { immediate: true },
)

async function handleSubmit() {
  if (!props.cashFlow) return
  const success = await store.changeCashFlow(props.cashFlow.id, { ...form, nominal: Number(form.nominal) })
  if (!success) {
    await showErrorDialog(store.message)
    return
  }
  await showSuccessDialog(store.message)
  emit('saved')
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-label="Ubah transaksi">
    <form class="card w-full max-w-lg space-y-4" @submit.prevent="handleSubmit">
      <h2 class="text-lg font-bold">Ubah Transaksi</h2>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="chg-type" class="mb-1 block text-sm font-medium">Jenis</label>
          <select id="chg-type" v-model="form.type" class="input">
            <option value="inflow">Inflow (Pemasukan)</option>
            <option value="outflow">Outflow (Pengeluaran)</option>
          </select>
        </div>
        <div>
          <label for="chg-source" class="mb-1 block text-sm font-medium">Sumber dana</label>
          <select id="chg-source" v-model="form.source" class="input">
            <option value="cash">Tunai</option>
            <option value="savings">Tabungan</option>
            <option value="loans">Pinjaman</option>
          </select>
        </div>
      </div>
      <div>
        <label for="chg-label" class="mb-1 block text-sm font-medium">Label kategori</label>
        <input id="chg-label" v-model="form.label" required class="input" />
      </div>
      <div>
        <label for="chg-nominal" class="mb-1 block text-sm font-medium">Nominal (Rp)</label>
        <input id="chg-nominal" v-model.number="form.nominal" type="number" min="1" required class="input" />
      </div>
      <div>
        <label for="chg-description" class="mb-1 block text-sm font-medium">Keterangan</label>
        <textarea id="chg-description" v-model="form.description" rows="3" required class="input" />
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" class="btn-ghost" @click="emit('close')">Batal</button>
        <button type="submit" class="btn-primary" :disabled="store.isCashFlowChange">
          {{ store.isCashFlowChange ? 'Menyimpan...' : 'Simpan perubahan' }}
        </button>
      </div>
    </form>
  </div>
</template>

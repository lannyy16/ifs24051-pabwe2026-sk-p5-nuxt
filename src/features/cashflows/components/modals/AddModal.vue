<script setup lang="ts">
import { useCashFlowsStore } from '../../states/cashFlowsStore'
import { showErrorDialog, showSuccessDialog } from '../../../../helpers/toolsHelper'
import { useInput } from '../../../../hooks/useInput'
import type { CashFlowSource, CashFlowType } from '../../api/cashFlowApi'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const store = useCashFlowsStore()
const { form, reset } = useInput({
  type: 'inflow' as CashFlowType,
  source: 'cash' as CashFlowSource,
  label: '',
  nominal: 0,
  description: '',
})

async function handleSubmit() {
  const success = await store.addCashFlow({ ...form, nominal: Number(form.nominal) })
  if (!success) {
    await showErrorDialog(store.message)
    return
  }
  await showSuccessDialog(store.message)
  reset()
  emit('saved')
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-label="Tambah transaksi">
    <form class="card w-full max-w-lg space-y-4" @submit.prevent="handleSubmit">
      <h2 class="text-lg font-bold">Tambah Transaksi</h2>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="add-type" class="mb-1 block text-sm font-medium">Jenis</label>
          <select id="add-type" v-model="form.type" class="input">
            <option value="inflow">Inflow (Pemasukan)</option>
            <option value="outflow">Outflow (Pengeluaran)</option>
          </select>
        </div>
        <div>
          <label for="add-source" class="mb-1 block text-sm font-medium">Sumber dana</label>
          <select id="add-source" v-model="form.source" class="input">
            <option value="cash">Tunai</option>
            <option value="savings">Tabungan</option>
            <option value="loans">Pinjaman</option>
          </select>
        </div>
      </div>
      <div>
        <label for="add-label" class="mb-1 block text-sm font-medium">Label kategori</label>
        <input id="add-label" v-model="form.label" required class="input" placeholder="mis. gaji" list="label-options" />
        <datalist id="label-options">
          <option v-for="label in store.labels" :key="label" :value="label" />
        </datalist>
      </div>
      <div>
        <label for="add-nominal" class="mb-1 block text-sm font-medium">Nominal (Rp)</label>
        <input id="add-nominal" v-model.number="form.nominal" type="number" min="1" required class="input" />
      </div>
      <div>
        <label for="add-description" class="mb-1 block text-sm font-medium">Keterangan</label>
        <textarea id="add-description" v-model="form.description" rows="3" required class="input" />
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" class="btn-ghost" @click="emit('close')">Batal</button>
        <button type="submit" class="btn-primary" :disabled="store.isCashFlowAdd">
          {{ store.isCashFlowAdd ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </div>
    </form>
  </div>
</template>

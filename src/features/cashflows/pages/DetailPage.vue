<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-vue-next'
import {
  SOURCE_LABELS,
  TYPE_LABELS,
  formatDateTime,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper'
import ChangeModal from '../modals/ChangeModal.vue'
import { useCashFlowsStore } from '../states/cashFlowsStore'

const route = useRoute()
const router = useRouter()
const store = useCashFlowsStore()
const showEdit = ref(false)

const load = () => store.fetchCashFlow(String(route.params.cashFlowId))

async function onSaved() {
  showEdit.value = false
  await load()
}

async function handleDelete() {
  if (!(await showConfirmDialog('Hapus transaksi?', 'Transaksi ini akan dihapus permanen.'))) return
  if (!(await store.deleteCashFlow(store.cashFlow!.id))) {
    await showErrorDialog(store.message)
    return
  }
  await showSuccessDialog(store.message)
  await router.replace('/')
}

onMounted(async () => {
  if (!(await load())) await showErrorDialog(store.message)
})
</script>

<template>
  <section class="mx-auto max-w-2xl space-y-4">
    <RouterLink to="/" class="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
      <ArrowLeft class="h-4 w-4" /> Kembali
    </RouterLink>

    <p v-if="store.isLoading" class="card text-center text-slate-500">Memuat rincian...</p>
    <p v-else-if="!store.cashFlow" class="card text-center text-slate-500">Transaksi tidak ditemukan.</p>
    <article v-else class="card space-y-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Rincian transaksi #{{ store.cashFlow.id }}</p>
          <h1 class="text-2xl font-extrabold">{{ store.cashFlow.label }}</h1>
        </div>
        <span
          class="rounded-full px-3 py-1 text-xs font-semibold"
          :class="store.cashFlow.type === 'inflow' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
        >
          {{ TYPE_LABELS[store.cashFlow.type] }}
        </span>
      </div>
      <p class="text-3xl font-extrabold text-brand-700">{{ formatRupiah(store.cashFlow.nominal) }}</p>
      <dl class="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt class="text-slate-500">Sumber dana</dt><dd class="font-semibold">{{ SOURCE_LABELS[store.cashFlow.source] }}</dd></div>
        <div><dt class="text-slate-500">Kategori label</dt><dd class="font-semibold">{{ store.cashFlow.label }}</dd></div>
        <div><dt class="text-slate-500">Dibuat</dt><dd class="font-semibold">{{ formatDateTime(store.cashFlow.created_at) }}</dd></div>
        <div><dt class="text-slate-500">Diperbarui</dt><dd class="font-semibold">{{ formatDateTime(store.cashFlow.updated_at) }}</dd></div>
        <div class="sm:col-span-2"><dt class="text-slate-500">Deskripsi</dt><dd class="font-semibold">{{ store.cashFlow.description }}</dd></div>
      </dl>
      <div class="flex justify-end gap-2">
        <button type="button" class="btn-ghost" @click="showEdit = true"><Pencil class="h-4 w-4" /> Ubah</button>
        <button type="button" class="btn-danger" @click="handleDelete"><Trash2 class="h-4 w-4" /> Hapus</button>
      </div>
    </article>

    <ChangeModal :open="showEdit" :cash-flow="store.cashFlow" @close="showEdit = false" @saved="onSaved" />
  </section>
</template>

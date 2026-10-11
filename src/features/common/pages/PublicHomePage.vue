
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Wallet, ArrowRight, ChartNoAxesCombined } from 'lucide-vue-next'
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-emerald-100 px-6 py-12">
    <section class="w-full max-w-3xl text-center">
      <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg">
        <Wallet class="h-8 w-8" />
      </div>

      <p class="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-600">
        Kelola Keuanganmu
      </p>

      <h1 class="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
        Delcom Cash Flow
      </h1>

      <p class="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
        Catat pemasukan dan pengeluaran, pantau arus kas, serta kelola
        keuangan pribadimu dengan lebih mudah dalam satu aplikasi.
      </p>

      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <RouterLink
          to="/auth/login"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-md transition hover:opacity-90"
        >
          Mulai Sekarang
          <ArrowRight class="h-5 w-5" />
        </RouterLink>

        <RouterLink
          to="/auth/register"
          class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Buat Akun
        </RouterLink>
      </div>

      <div class="mx-auto mt-12 grid max-w-xl gap-4 sm:grid-cols-2">
        <div class="rounded-2xl border border-white bg-white/80 p-5 text-left shadow-sm">
          <Wallet class="mb-3 h-6 w-6 text-brand-600" />
          <h2 class="font-bold text-slate-900">Pencatatan Arus Kas</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Catat dan kelola transaksi keuanganmu setelah masuk ke akun.
          </p>
        </div>

        <div class="rounded-2xl border border-white bg-white/80 p-5 text-left shadow-sm">
          <ChartNoAxesCombined class="mb-3 h-6 w-6 text-emerald-600" />
          <h2 class="font-bold text-slate-900">Pantau Keuangan</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Lihat ringkasan pemasukan dan pengeluaran melalui dashboard.
          </p>
        </div>
      </div>

      <p class="mt-10 text-sm text-slate-500">
        Delcom Cash Flow · Kelola keuangan dengan lebih teratur
      </p>
    </section>
  </main>
</template>

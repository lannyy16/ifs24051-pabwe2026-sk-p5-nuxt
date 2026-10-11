<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
    <p class="text-7xl font-extrabold text-brand-600">404</p>
    <h1 class="mt-2 text-2xl font-bold">Halaman tidak ditemukan</h1>
    <p class="mt-1 text-slate-500">Alamat yang kamu tuju tidak tersedia atau sudah dipindahkan.</p>
    <RouterLink to="/" class="btn-primary mt-6">Kembali ke beranda</RouterLink>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { Wallet } from 'lucide-vue-next'
import { getAccessToken } from '../../../helpers/apiHelper'

const router = useRouter()

onMounted(() => {
  if (getAccessToken()) router.replace('/')
})
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-emerald-100 px-4 py-10">
    <div class="w-full max-w-md">
      <div class="mb-6 flex flex-col items-center text-center">
        <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg">
          <Wallet class="h-7 w-7" />
        </div>
        <h1 class="text-2xl font-extrabold text-brand-900">Delcom Cash Flow</h1>
        <p class="text-sm text-slate-600">Catat dan pantau arus kas pribadimu dengan mudah.</p>
      </div>
      <div class="card p-6 sm:p-8">
        <RouterView />
      </div>
    </div>
  </main>
</template>

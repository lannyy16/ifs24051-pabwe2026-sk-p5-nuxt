<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'
import { useInput } from '../../../hooks/useInput'
import { useAuthStore } from '../states/authStore'

const router = useRouter()
const authStore = useAuthStore()
const { form } = useInput({ name: '', email: '', password: '' })

async function handleSubmit() {
  const success = await authStore.register({ name: form.name, email: form.email, password: form.password })
  if (!success) {
    await showErrorDialog(authStore.message)
    return
  }
  await showSuccessDialog(authStore.message)
  await router.push('/auth/login')
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <h2 class="text-xl font-bold">Buat akun baru</h2>
    <div>
      <label for="name" class="mb-1 block text-sm font-medium">Nama lengkap</label>
      <input id="name" v-model="form.name" type="text" required class="input" placeholder="Nama kamu" />
    </div>
    <div>
      <label for="email" class="mb-1 block text-sm font-medium">Email</label>
      <input id="email" v-model="form.email" type="email" required class="input" placeholder="nama@delcom.org" />
    </div>
    <div>
      <label for="password" class="mb-1 block text-sm font-medium">Kata sandi</label>
      <input id="password" v-model="form.password" type="password" required minlength="6" class="input" placeholder="Minimal 6 karakter" />
    </div>
    <button type="submit" class="btn-primary w-full" :disabled="authStore.isLoading">
      {{ authStore.isLoading ? 'Memproses...' : 'Daftar' }}
    </button>
    <p class="text-center text-sm text-slate-500">
      Sudah punya akun?
      <RouterLink to="/auth/login" class="font-semibold text-brand-700 hover:underline">Masuk</RouterLink>
    </p>
  </form>
</template>

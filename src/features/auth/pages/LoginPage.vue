<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'
import { useInput } from '../../../hooks/useInput'
import { useAuthStore } from '../states/authStore'

const router = useRouter()
const authStore = useAuthStore()
const { form } = useInput({ email: '', password: '' })

async function handleSubmit() {
  const success = await authStore.login({ email: form.email, password: form.password })
  if (!success) {
    await showErrorDialog(authStore.message)
    return
  }
  await showSuccessDialog(authStore.message)
  await router.push('/')
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <h2 class="text-xl font-bold">Masuk ke akun</h2>
    <div>
      <label for="login-email-input" class="mb-1 block text-sm font-medium">Email</label>
      <input id="login-email-input" v-model="form.email" type="email" required class="input" placeholder="nama@delcom.org" />
    </div>
    <div>
      <label for="login-password-input" class="mb-1 block text-sm font-medium">Kata sandi</label>
      <input id="login-password-input" v-model="form.password" type="password" required class="input" placeholder="••••••" />
    </div>
    <button id="login-submit-button" type="submit" class="btn-primary w-full" :disabled="authStore.isLoading">
      {{ authStore.isLoading ? 'Memproses...' : 'Masuk' }}
    </button>
    <p class="text-center text-sm text-slate-500">
      Belum punya akun?
      <RouterLink to="/auth/register" class="font-semibold text-brand-700 hover:underline">Daftar</RouterLink>
    </p>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut, Menu } from 'lucide-vue-next'
import { showConfirmDialog } from '../../../helpers/toolsHelper'
import { useAuthStore } from '../../auth/states/authStore'
import { useUsersStore } from '../../users/states/usersStore'

const emit = defineEmits<{ (e: 'toggle-sidebar'): void }>()

const router = useRouter()
const authStore = useAuthStore()
const usersStore = useUsersStore()

const profile = computed(() => usersStore.profile)

async function handleLogout() {
  const confirmed = await showConfirmDialog('Keluar dari akun?', 'Sesi kamu akan diakhiri.')
  if (!confirmed) return
  await authStore.logout()
  await router.replace('/auth/login')
}
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
    <div class="flex items-center gap-3">
      <button type="button" aria-label="Buka menu" class="btn-ghost !px-2.5 lg:hidden" @click="emit('toggle-sidebar')">
        <Menu class="h-5 w-5" />
      </button>
      <span class="text-lg font-extrabold text-brand-700">Delcom Cash Flow</span>
    </div>
    <div class="flex items-center gap-4">
      <div v-if="profile" class="hidden text-right sm:block">
        <p class="text-sm font-semibold leading-tight">{{ profile.name }}</p>
        <p class="text-xs text-slate-500">@{{ profile.email.split('@')[0] }}</p>
      </div>
      <span v-else class="text-sm text-slate-500">Memuat profil...</span>
      <span class="hidden items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 md:flex">
        <span class="h-2 w-2 rounded-full bg-brand-500" /> Sesi aktif
      </span>
      <button type="button" class="btn-ghost" @click="handleLogout">
        <LogOut class="h-4 w-4" /> Keluar
      </button>
    </div>
  </header>
</template>

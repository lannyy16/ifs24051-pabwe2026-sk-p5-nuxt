<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { LayoutDashboard, UserCircle, Users } from 'lucide-vue-next'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const menus = [
  { to: '/', label: 'Ringkasan Arus Kas', icon: LayoutDashboard },
  { to: '/users', label: 'Direktori Pengguna', icon: Users },
  { to: '/profile', label: 'Profil Saya', icon: UserCircle },
]
</script>

<template>
  <aside
    data-testid="sidebar"
    class="fixed inset-y-0 left-0 z-20 w-64 border-r border-slate-200 bg-white pt-20 transition-transform lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <nav class="space-y-1 px-3">
      <RouterLink
        v-for="menu in menus"
        :key="menu.to"
        :to="menu.to"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-brand-50 hover:text-brand-700"
        active-class="!bg-brand-50 !text-brand-700"
        exact-active-class="!bg-brand-50 !text-brand-700"
        @click="emit('close')"
      >
        <component :is="menu.icon" class="h-5 w-5" />
        {{ menu.label }}
      </RouterLink>
    </nav>
  </aside>
</template>

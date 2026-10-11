<script setup lang="ts">
import { onMounted } from 'vue'
import { resolvePhotoUrl, showErrorDialog } from '../../../helpers/toolsHelper'
import { useUsersStore } from '../states/usersStore'

const store = useUsersStore()

onMounted(async () => {
  if (!(await store.fetchUsers())) await showErrorDialog(store.message)
})
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-extrabold">Direktori Pengguna</h1>
      <p class="text-sm text-slate-500">Daftar seluruh pengguna yang terdaftar di sistem.</p>
    </div>
    <p v-if="store.isLoading" class="card text-center text-slate-500">Memuat pengguna...</p>
    <p v-else-if="store.users.length === 0" class="card text-center text-slate-500">Belum ada pengguna.</p>
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="user in store.users" :key="user.id" class="card flex items-center gap-4" data-testid="user-card">
        <img v-if="user.photo" :src="resolvePhotoUrl(user.photo)" :alt="user.name" class="h-12 w-12 rounded-full object-cover" />
        <div v-else class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
          {{ user.name.charAt(0).toUpperCase() }}
        </div>
        <div class="min-w-0">
          <p class="truncate font-semibold">{{ user.name }}</p>
          <p class="truncate text-sm text-slate-500">{{ user.email }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

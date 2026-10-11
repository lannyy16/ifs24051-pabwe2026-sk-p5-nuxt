<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { getAccessToken } from '../../../helpers/apiHelper'
import { useAuthStore } from '../../auth/states/authStore'
import { useUsersStore } from '../../users/states/usersStore'
import NavbarComponent from '../components/NavbarComponent.vue'
import SidebarComponent from '../components/SidebarComponent.vue'

const router = useRouter()
const authStore = useAuthStore()
const usersStore = useUsersStore()

const ready = ref(false)
const sidebarOpen = ref(false)

onMounted(async () => {
  if (!getAccessToken()) {
    await router.replace('/auth/login')
    return
  }
  const valid = await usersStore.fetchProfile()
  if (!valid) {
    authStore.clearSession()
    await router.replace('/auth/login')
    return
  }
  ready.value = true
})
</script>

<template>
  <div class="min-h-screen">
    <NavbarComponent @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <SidebarComponent :open="sidebarOpen" @close="sidebarOpen = false" />
    <main class="px-4 py-6 lg:pl-72 lg:pr-8">
      <RouterView v-if="ready" />
    </main>
  </div>
</template>

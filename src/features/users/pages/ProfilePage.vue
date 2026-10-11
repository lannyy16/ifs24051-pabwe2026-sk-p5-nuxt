<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { resolvePhotoUrl, showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'
import { useInput } from '../../../hooks/useInput'
import { useUsersStore } from '../states/usersStore'

const store = useUsersStore()
const { form: profileForm, setForm } = useInput({ name: '', email: '' })
const { form: passwordForm, reset: resetPassword } = useInput({
  password: '',
  new_password: '',
  new_password_confirmation: '',
})

watch(
  () => store.profile,
  (profile) => {
    if (profile) setForm({ name: profile.name, email: profile.email })
  },
  { immediate: true },
)

async function report(success: boolean) {
  if (success) {
    await showSuccessDialog(store.message)
  } else {
    await showErrorDialog(store.message)
  }
  return success
}

const saveProfile = async () => report(await store.updateProfile({ ...profileForm }))

async function onPhotoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files![0]
  if (file) await report(await store.uploadPhoto(file))
}

async function savePassword() {
  if (await report(await store.changePassword({ ...passwordForm }))) resetPassword()
}

onMounted(async () => {
  if (!store.profile) await store.fetchProfile()
})
</script>

<template>
  <section class="mx-auto max-w-2xl space-y-6">
    <div>
      <h1 class="text-2xl font-extrabold">Profil Saya</h1>
      <p class="text-sm text-slate-500">Kelola informasi akun dan keamananmu.</p>
    </div>

    <div class="card flex items-center gap-4">
      <img v-if="store.profile?.photo" :src="resolvePhotoUrl(store.profile.photo)" alt="Foto profil" class="h-16 w-16 rounded-full object-cover" />
      <div v-else class="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
        {{ profileForm.name.charAt(0).toUpperCase() }}
      </div>
      <div>
        <label for="photo" class="btn-ghost cursor-pointer">Ganti foto</label>
        <input id="photo" type="file" accept="image/*" class="sr-only" @change="onPhotoChange" />
      </div>
    </div>

    <form class="card space-y-4" @submit.prevent="saveProfile">
      <h2 class="font-bold">Informasi akun</h2>
      <div>
        <label for="profile-name" class="mb-1 block text-sm font-medium">Nama</label>
        <input id="profile-name" v-model="profileForm.name" required class="input" />
      </div>
      <div>
        <label for="profile-email" class="mb-1 block text-sm font-medium">Email</label>
        <input id="profile-email" v-model="profileForm.email" type="email" required class="input" />
      </div>
      <button type="submit" class="btn-primary" :disabled="store.isSaving">Simpan profil</button>
    </form>

    <form class="card space-y-4" @submit.prevent="savePassword">
      <h2 class="font-bold">Ubah kata sandi</h2>
      <div>
        <label for="pw-old" class="mb-1 block text-sm font-medium">Kata sandi saat ini</label>
        <input id="pw-old" v-model="passwordForm.password" type="password" required class="input" />
      </div>
      <div>
        <label for="pw-new" class="mb-1 block text-sm font-medium">Kata sandi baru</label>
        <input id="pw-new" v-model="passwordForm.new_password" type="password" required minlength="6" class="input" />
      </div>
      <div>
        <label for="pw-confirm" class="mb-1 block text-sm font-medium">Konfirmasi kata sandi baru</label>
        <input id="pw-confirm" v-model="passwordForm.new_password_confirmation" type="password" required class="input" />
      </div>
      <button type="submit" class="btn-primary" :disabled="store.isSaving">Ubah kata sandi</button>
    </form>
  </section>
</template>

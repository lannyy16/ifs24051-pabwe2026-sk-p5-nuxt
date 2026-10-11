import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAccessToken, putAccessToken } from '../../../helpers/apiHelper'
import { loginApi, logoutApi, registerApi } from '../api/authApi'
import { useAuthStore } from './authStore'

vi.mock('../api/authApi')

const user = { id: 1, name: 'A', email: 'a@b.c' }

beforeEach(() => {
  setActivePinia(createPinia())
  vi.mocked(loginApi).mockReset()
  vi.mocked(registerApi).mockReset()
  vi.mocked(logoutApi).mockReset()
})

describe('useAuthStore', () => {
  it('state awal membaca token dari penyimpanan', () => {
    putAccessToken('saved')
    const store = useAuthStore()
    expect(store.token).toBe('saved')
    expect(store.isAuthenticated).toBe(true)
  })

  it('login sukses menyimpan token dan user', async () => {
    vi.mocked(loginApi).mockResolvedValue({ status: 'success', message: 'Berhasil login', data: { user, token: 'tok' } })
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(await store.login({ email: 'a@b.c', password: '1' })).toBe(true)
    expect(store.user).toEqual(user)
    expect(store.token).toBe('tok')
    expect(getAccessToken()).toBe('tok')
    expect(store.message).toBe('Berhasil login')
    expect(store.isLoading).toBe(false)
  })

  it('login gagal menyimpan pesan error', async () => {
    vi.mocked(loginApi).mockRejectedValue(new Error('Kredensial salah'))
    const store = useAuthStore()
    expect(await store.login({ email: 'a@b.c', password: '1' })).toBe(false)
    expect(store.message).toBe('Kredensial salah')
    expect(store.isLoading).toBe(false)
  })

  it('register sukses dan gagal', async () => {
    const store = useAuthStore()
    vi.mocked(registerApi).mockResolvedValueOnce({ status: 'success', message: 'Terdaftar', data: null })
    expect(await store.register({ name: 'A', email: 'a@b.c', password: '123456' })).toBe(true)
    expect(store.message).toBe('Terdaftar')
    vi.mocked(registerApi).mockRejectedValueOnce(new Error('Email dipakai'))
    expect(await store.register({ name: 'A', email: 'a@b.c', password: '123456' })).toBe(false)
    expect(store.message).toBe('Email dipakai')
  })

  it('logout membersihkan sesi baik API sukses maupun gagal', async () => {
    const store = useAuthStore()
    store.token = 'tok'
    store.user = user
    putAccessToken('tok')
    vi.mocked(logoutApi).mockResolvedValueOnce({ status: 'success', message: 'ok', data: null })
    await store.logout()
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(getAccessToken()).toBeNull()

    store.token = 'tok2'
    vi.mocked(logoutApi).mockRejectedValueOnce(new Error('401'))
    await store.logout()
    expect(store.token).toBeNull()
  })
})

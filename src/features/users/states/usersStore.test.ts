import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { changePasswordApi, getMeApi, getUsersApi, updateMeApi, uploadPhotoApi } from '../api/userApi'
import { useUsersStore } from './usersStore'

vi.mock('../api/userApi')

const user = { id: 1, name: 'A', email: 'a@b.c' }
const ok = (data: unknown, message = 'ok') => ({ status: 'success', message, data })

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetAllMocks()
})

describe('useUsersStore', () => {
  it('fetchUsers sukses dan gagal', async () => {
    const store = useUsersStore()
    vi.mocked(getUsersApi).mockResolvedValueOnce(ok({ users: [user] }))
    expect(await store.fetchUsers()).toBe(true)
    expect(store.users).toEqual([user])
    vi.mocked(getUsersApi).mockRejectedValueOnce(new Error('gagal'))
    expect(await store.fetchUsers()).toBe(false)
    expect(store.message).toBe('gagal')
    expect(store.isLoading).toBe(false)
  })

  it('fetchProfile sukses dan gagal', async () => {
    const store = useUsersStore()
    vi.mocked(getMeApi).mockResolvedValueOnce(ok({ user }))
    expect(await store.fetchProfile()).toBe(true)
    expect(store.profile).toEqual(user)
    vi.mocked(getMeApi).mockRejectedValueOnce(new Error('401'))
    expect(await store.fetchProfile()).toBe(false)
    expect(store.message).toBe('401')
  })

  it('updateProfile sukses dan gagal', async () => {
    const store = useUsersStore()
    vi.mocked(updateMeApi).mockResolvedValueOnce(ok({ user: { ...user, name: 'B' } }, 'Diubah'))
    expect(await store.updateProfile({ name: 'B', email: 'a@b.c' })).toBe(true)
    expect(store.profile?.name).toBe('B')
    expect(store.message).toBe('Diubah')
    vi.mocked(updateMeApi).mockRejectedValueOnce(new Error('invalid'))
    expect(await store.updateProfile({ name: '', email: '' })).toBe(false)
    expect(store.message).toBe('invalid')
    expect(store.isSaving).toBe(false)
  })

  it('uploadPhoto sukses (memuat ulang profil) dan gagal', async () => {
    const store = useUsersStore()
    const file = new File(['x'], 'p.png')
    vi.mocked(uploadPhotoApi).mockResolvedValueOnce(ok(null, 'Foto diubah'))
    vi.mocked(getMeApi).mockResolvedValueOnce(ok({ user }))
    expect(await store.uploadPhoto(file)).toBe(true)
    expect(store.profile).toEqual(user)
    vi.mocked(uploadPhotoApi).mockRejectedValueOnce(new Error('file besar'))
    expect(await store.uploadPhoto(file)).toBe(false)
    expect(store.message).toBe('file besar')
  })

  it('changePassword sukses dan gagal', async () => {
    const store = useUsersStore()
    const payload = { password: '1', new_password: '2', new_password_confirmation: '2' }
    vi.mocked(changePasswordApi).mockResolvedValueOnce(ok(null, 'Sandi diubah'))
    expect(await store.changePassword(payload)).toBe(true)
    expect(store.message).toBe('Sandi diubah')
    vi.mocked(changePasswordApi).mockRejectedValueOnce(new Error('salah'))
    expect(await store.changePassword(payload)).toBe(false)
    expect(store.message).toBe('salah')
  })
})

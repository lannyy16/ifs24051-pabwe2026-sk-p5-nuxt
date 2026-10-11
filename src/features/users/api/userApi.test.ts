import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../helpers/apiHelper'
import { changePasswordApi, getMeApi, getUsersApi, updateMeApi, uploadPhotoApi } from './userApi'

vi.mock('../../../helpers/apiHelper')

beforeEach(() => vi.mocked(apiRequest).mockReset())

describe('userApi', () => {
  it('GET /users dan GET /users/me', async () => {
    await getUsersApi()
    await getMeApi()
    expect(apiRequest).toHaveBeenNthCalledWith(1, '/users')
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/users/me')
  })

  it('PUT /users/me', async () => {
    const payload = { name: 'A', email: 'a@b.c' }
    await updateMeApi(payload)
    expect(apiRequest).toHaveBeenCalledWith('/users/me', { method: 'PUT', body: payload })
  })

  it('POST /users/me/photo mengirim FormData', async () => {
    const file = new File(['x'], 'p.png', { type: 'image/png' })
    await uploadPhotoApi(file)
    const [path, options] = vi.mocked(apiRequest).mock.calls[0]
    expect(path).toBe('/users/me/photo')
    expect(options?.method).toBe('POST')
    expect(options?.formData?.get('photo')).toBeInstanceOf(File)
  })

  it('PUT ubah password', async () => {
    const payload = { password: '1', new_password: '2', new_password_confirmation: '2' }
    await changePasswordApi(payload)
    expect(apiRequest).toHaveBeenCalledWith('/users/password', { method: 'PUT', body: payload })
  })
})

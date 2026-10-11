import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../helpers/apiHelper'
import { loginApi, logoutApi, registerApi } from './authApi'

vi.mock('../../../helpers/apiHelper')

beforeEach(() => vi.mocked(apiRequest).mockReset())

describe('authApi', () => {
  it('login memanggil POST /auth/login tanpa token', async () => {
    const payload = { email: 'a@b.c', password: '123456' }
    await loginApi(payload)
    expect(apiRequest).toHaveBeenCalledWith('/auth/login', { method: 'POST', body: payload, auth: false })
  })

  it('register memanggil POST /auth/register tanpa token', async () => {
    const payload = { name: 'A', email: 'a@b.c', password: '123456' }
    await registerApi(payload)
    expect(apiRequest).toHaveBeenCalledWith('/auth/register', { method: 'POST', body: payload, auth: false })
  })

  it('logout memanggil POST /auth/logout', async () => {
    await logoutApi()
    expect(apiRequest).toHaveBeenCalledWith('/auth/logout', { method: 'POST' })
  })
})

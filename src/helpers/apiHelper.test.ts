import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest, getAccessToken, getErrorMessage, putAccessToken } from './apiHelper'

const fetchMock = vi.fn()
const reply = (body: unknown, ok = true) => ({ ok, json: async () => body })

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})
afterEach(() => vi.unstubAllGlobals())

describe('token helpers', () => {
  it('menyimpan, membaca, dan menghapus token', () => {
    expect(getAccessToken()).toBeNull()
    putAccessToken('abc')
    expect(getAccessToken()).toBe('abc')
    putAccessToken(null)
    expect(getAccessToken()).toBeNull()
  })
})

describe('getErrorMessage', () => {
  it('mengambil pesan dari Error atau memakai pesan default', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom')
    expect(getErrorMessage('x')).toBe('Terjadi kesalahan tak terduga')
  })
})

describe('apiRequest', () => {
  it('GET dengan query (mengabaikan nilai kosong) dan bearer token', async () => {
    putAccessToken('tok')
    fetchMock.mockResolvedValue(reply({ status: 'success', message: 'ok', data: { a: 1 } }))
    const res = await apiRequest('/x', { query: { type: 'inflow', label: '', a: undefined, b: null, n: 2 } })
    expect(res.data).toEqual({ a: 1 })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${DELCOM_BASEURL}/x?type=inflow&n=2`)
    expect(init.method).toBe('GET')
    expect(init.headers.Authorization).toBe('Bearer tok')
    expect(init.body).toBeUndefined()
  })

  it('tanpa token / auth=false tidak mengirim Authorization dan URL tanpa query', async () => {
    fetchMock.mockResolvedValue(reply({ status: 'success', message: 'ok', data: null }))
    await apiRequest('/x')
    expect(fetchMock.mock.calls[0][0]).toBe(`${DELCOM_BASEURL}/x`)
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
    putAccessToken('tok')
    await apiRequest('/x', { auth: false })
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBeUndefined()
  })

  it('mengirim body JSON dan FormData', async () => {
    fetchMock.mockResolvedValue(reply({ status: 'success', message: 'ok', data: null }))
    await apiRequest('/x', { method: 'POST', body: { a: 1 } })
    expect(fetchMock.mock.calls[0][1].body).toBe('{"a":1}')
    expect(fetchMock.mock.calls[0][1].headers['Content-Type']).toBe('application/json')
    const formData = new FormData()
    await apiRequest('/x', { method: 'POST', formData })
    expect(fetchMock.mock.calls[1][1].body).toBe(formData)
    expect(fetchMock.mock.calls[1][1].headers['Content-Type']).toBeUndefined()
  })

  it('melempar ApiError saat jaringan gagal', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    await expect(apiRequest('/x')).rejects.toThrow('Tidak dapat terhubung ke server')
  })

  it('melempar ApiError saat respon bukan JSON', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('bad json')
      },
    })
    await expect(apiRequest('/x')).rejects.toThrow('Respon server tidak valid')
  })

  it('menggabungkan pesan validasi dari data', async () => {
    fetchMock.mockResolvedValue(reply({ status: 'fail', message: 'Data tidak valid', data: { email: ['Email wajib', 'Format salah'] } }, false))
    const error = await apiRequest('/x').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe('Data tidak valid: Email wajib, Format salah')
    expect(error.data).toEqual({ email: ['Email wajib', 'Format salah'] })
  })

  it('memakai pesan server bila data bukan objek atau kosong', async () => {
    fetchMock.mockResolvedValueOnce(reply({ status: 'fail', message: 'Gagal', data: 'teks' }))
    await expect(apiRequest('/x')).rejects.toThrow('Gagal')
    fetchMock.mockResolvedValueOnce(reply({ status: 'fail', message: 'Gagal 2', data: {} }))
    await expect(apiRequest('/x')).rejects.toThrow('Gagal 2')
    fetchMock.mockResolvedValueOnce(reply({ status: 'fail', message: 'Gagal 3' }))
    await expect(apiRequest('/x')).rejects.toThrow('Gagal 3')
  })

  it('memakai pesan default bila server tidak memberi pesan', async () => {
    fetchMock.mockResolvedValue(reply({ status: 'fail', message: '' }, false))
    await expect(apiRequest('/x')).rejects.toThrow('Permintaan gagal diproses')
  })
})

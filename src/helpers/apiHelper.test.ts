import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  apiRequest,
  getAccessToken,
  putAccessToken,
  getErrorMessage,
  ApiError,
} from './apiHelper'

const fetchMock = vi.fn()

describe('apiHelper', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
    localStorage.clear()
    putAccessToken(null)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('getAccessToken dan putAccessToken', () => {
    it('mengembalikan null jika token belum tersedia', () => {
      expect(getAccessToken()).toBeNull()
    })

    it('menyimpan dan mengambil token', () => {
      putAccessToken('token-123')

      expect(getAccessToken()).toBe('token-123')
    })

    it('menghapus token jika diberi null', () => {
      putAccessToken('token-123')
      putAccessToken(null)

      expect(getAccessToken()).toBeNull()
    })

    it('menghapus token jika diberi string kosong', () => {
      putAccessToken('token-123')
      putAccessToken('')

      expect(getAccessToken()).toBeNull()
    })

    it('mengembalikan null jika localStorage tidak tersedia', () => {
      vi.stubGlobal('localStorage', undefined)

      expect(getAccessToken()).toBeNull()
    })

    it('tidak error ketika menyimpan token tanpa localStorage', () => {
      vi.stubGlobal('localStorage', undefined)

      expect(() => putAccessToken('token-123')).not.toThrow()
    })
  })

  describe('getErrorMessage', () => {
    it('mengambil pesan dari Error', () => {
      expect(getErrorMessage(new Error('Terjadi masalah'))).toBe(
        'Terjadi masalah',
      )
    })

    it('mengembalikan pesan default untuk error non-Error', () => {
      expect(getErrorMessage('error')).toBe(
        'Terjadi kesalahan tak terduga',
      )
    })

    it('menangani null', () => {
      expect(getErrorMessage(null)).toBe(
        'Terjadi kesalahan tak terduga',
      )
    })
  })

  describe('apiRequest', () => {
    it('melakukan GET dan mengembalikan data JSON', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'success',
            message: 'Berhasil',
            data: { id: 1 },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )

      const result = await apiRequest('/test')

      expect(result.data).toEqual({ id: 1 })
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('menghapus slash berlebih pada URL dan mengirim query', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'success',
            message: 'Berhasil',
            data: [],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )

      await apiRequest('//test', {
        query: {
          page: 2,
          search: 'makan',
          kosong: '',
          kosongNull: null,
          tidakAda: undefined,
        },
      })

      const call = fetchMock.mock.calls[0]

      if (!call) {
        throw new Error('Pemanggilan fetch tidak ditemukan')
      }

      const url = String(call[0])

      expect(url).toContain('page=2')
      expect(url).toContain('search=makan')
      expect(url).not.toContain('kosong=')
      expect(url).not.toContain('kosongNull=')
      expect(url).not.toContain('tidakAda=')
    })

    it('mengirim token Bearer jika autentikasi aktif', async () => {
      putAccessToken('token-rahasia')

      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'success',
            message: 'Berhasil',
            data: {},
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )

      await apiRequest('/test')

      const call = fetchMock.mock.calls[0]

      if (!call) {
        throw new Error('Pemanggilan fetch tidak ditemukan')
      }

      const init = call[1] as RequestInit

      expect(
        new Headers(init.headers).get('Authorization'),
      ).toBe('Bearer token-rahasia')
    })

    it('tidak mengirim token jika auth false', async () => {
      putAccessToken('token-rahasia')

      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'success',
            message: 'Berhasil',
            data: {},
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )

      await apiRequest('/test', { auth: false })

      const call = fetchMock.mock.calls[0]

      if (!call) {
        throw new Error('Pemanggilan fetch tidak ditemukan')
      }

      const init = call[1] as RequestInit

      expect(
        new Headers(init.headers).get('Authorization'),
      ).toBeNull()
    })

    it('mengirim body JSON untuk request biasa', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'success',
            message: 'Berhasil',
            data: {},
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )

      await apiRequest('/test', {
        method: 'POST',
        body: { nama: 'Karina' },
      })

      const call = fetchMock.mock.calls[0]

      if (!call) {
        throw new Error('Pemanggilan fetch tidak ditemukan')
      }

      const init = call[1] as RequestInit

      expect(init.method).toBe('POST')
      expect(init.body).toBe(JSON.stringify({ nama: 'Karina' }))
    })

    it('mengirim FormData tanpa memaksa Content-Type JSON', async () => {
      const formData = new FormData()
      formData.append('nama', 'Karina')

      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'success',
            message: 'Berhasil',
            data: {},
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )

      await apiRequest('/test', {
        method: 'POST',
        formData,
      })

      const call = fetchMock.mock.calls[0]

      if (!call) {
        throw new Error('Pemanggilan fetch tidak ditemukan')
      }

      const init = call[1] as RequestInit

      expect(init.body).toBe(formData)
      expect(
        new Headers(init.headers).get('Content-Type'),
      ).toBeNull()
    })

    it('melempar ApiError saat server mengembalikan detail validasi', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'error',
            message: 'Validasi gagal',
            data: {
              nama: ['Nama wajib diisi'],
              email: ['Email tidak valid'],
            },
          }),
          {
            status: 422,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )

      try {
        await apiRequest('/test')
        throw new Error('Seharusnya request gagal')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as Error).message).toContain('Validasi gagal')
        expect((error as ApiError).data).toEqual({
          nama: ['Nama wajib diisi'],
          email: ['Email tidak valid'],
        })
      }
    })

    it('menangani detail error berupa nilai kosong dan non-string', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'error',
            message: '',
            data: {
              kosong: '',
              angka: 123,
              boolean: false,
            },
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )

      await expect(apiRequest('/test')).rejects.toThrow(
        'Permintaan gagal diproses',
      )
    })

    it('menggunakan pesan default saat message kosong tetapi detail tersedia', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'error',
            message: '',
            data: {
              nama: ['Nama tidak valid'],
            },
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )

      await expect(apiRequest('/test')).rejects.toThrow(
        'Permintaan gagal: Nama tidak valid',
      )
    })

    it('menangani response error tanpa data', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'error',
            message: 'Gagal mengambil data',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )

      await expect(apiRequest('/test')).rejects.toThrow(
        'Gagal mengambil data',
      )
    })

    it('menangani response error dengan data string', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'error',
            message: 'Gagal',
            data: 'teks',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )

      await expect(apiRequest('/test')).rejects.toThrow('Gagal')
    })

    it('menangani response error dengan data object kosong', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'error',
            message: 'Gagal',
            data: {},
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )

      await expect(apiRequest('/test')).rejects.toThrow('Gagal')
    })

    it('menangani response JSON yang tidak valid', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response('bukan JSON', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      await expect(apiRequest('/test')).rejects.toThrow()
    })

    it('menangani kegagalan jaringan', async () => {
      fetchMock.mockRejectedValueOnce(
        new Error('Jaringan terputus'),
      )

      await expect(apiRequest('/test')).rejects.toThrow(
        'Tidak dapat terhubung ke server',
      )
    })
  })
})

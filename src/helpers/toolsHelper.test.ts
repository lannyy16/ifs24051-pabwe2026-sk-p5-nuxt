import Swal from 'sweetalert2'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  formatDateTime,
  formatRupiah,
  resolvePhotoUrl,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  toApiDate,
} from './toolsHelper'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

beforeEach(() => vi.mocked(Swal.fire).mockReset())

describe('dialog helpers', () => {
  it('menampilkan dialog sukses dan error', async () => {
    vi.mocked(Swal.fire).mockResolvedValue({} as never)
    await showSuccessDialog('Berhasil!')
    await showErrorDialog('Oops')
    expect(Swal.fire).toHaveBeenNthCalledWith(1, expect.objectContaining({ icon: 'success', text: 'Berhasil!' }))
    expect(Swal.fire).toHaveBeenNthCalledWith(2, expect.objectContaining({ icon: 'error', text: 'Oops' }))
  })

  it('dialog konfirmasi mengembalikan status konfirmasi', async () => {
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true } as never)
    expect(await showConfirmDialog('Judul', 'Teks')).toBe(true)
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: false } as never)
    expect(await showConfirmDialog('Judul', 'Teks')).toBe(false)
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ showCancelButton: true, title: 'Judul' }))
  })
})

describe('format helpers', () => {
  it('formatRupiah memakai format IDR Indonesia', () => {
    const text = formatRupiah(1500000)
    expect(text).toContain('Rp')
    expect(text).toContain('1.500.000')
  })

  it('formatDateTime memformat tanggal', () => {
    expect(formatDateTime('2024-10-05T12:09:16.000000Z')).toContain('2024')
  })

  it('toApiDate membuat timestamp awal/akhir hari atau string kosong', () => {
    expect(toApiDate('', false)).toBe('')
    expect(toApiDate('2024-10-05', false)).toBe('2024-10-05 00:00:00')
    expect(toApiDate('2024-10-05', true)).toBe('2024-10-05 23:59:59')
  })

  it('resolvePhotoUrl menangani URL absolut dan relatif', () => {
    const origin = new URL(DELCOM_BASEURL).origin
    expect(resolvePhotoUrl('https://x.test/a.png')).toBe('https://x.test/a.png')
    expect(resolvePhotoUrl('img/profile/1.png')).toBe(`${origin}/img/profile/1.png`)
    expect(resolvePhotoUrl('/img/profile/1.png')).toBe(`${origin}/img/profile/1.png`)
  })
})

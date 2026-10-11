import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as tools from '../../../helpers/toolsHelper'
import { renderWithProviders, sampleUser } from '../../../test-utils'
import * as api from '../api/userApi'
import ProfilePage from './ProfilePage.vue'

vi.mock('../api/userApi')
vi.mock('../../../helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../helpers/toolsHelper')>()),
  showSuccessDialog: vi.fn().mockResolvedValue(undefined),
  showErrorDialog: vi.fn().mockResolvedValue(undefined),
}))

const ok = (data: unknown, message = 'ok') => ({ status: 'success', message, data }) as never
const withProfile = { initialState: { users: { profile: sampleUser } } }

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(tools.showSuccessDialog).mockResolvedValue(undefined)
  vi.mocked(tools.showErrorDialog).mockResolvedValue(undefined)
})

describe('ProfilePage', () => {
  it('memuat profil saat belum ada dan mengisi form', async () => {
    vi.mocked(api.getMeApi).mockResolvedValue(ok({ user: { ...sampleUser, photo: 'img/profile/1.png' } }))
    await renderWithProviders(ProfilePage)
    await waitFor(() => expect((screen.getByLabelText('Nama') as HTMLInputElement).value).toBe('Delcom Testing'))
    expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('testing@delcom.org')
    expect(screen.getByAltText('Foto profil')).toHaveAttribute('src', expect.stringContaining('/img/profile/1.png'))
  })

  it('tidak memuat ulang bila profil sudah ada dan menampilkan inisial tanpa foto', async () => {
    await renderWithProviders(ProfilePage, withProfile)
    expect(api.getMeApi).not.toHaveBeenCalled()
    expect(screen.getByText('D')).toBeInTheDocument()
  })

  it('menyimpan profil: sukses dan gagal', async () => {
    vi.mocked(api.updateMeApi).mockResolvedValueOnce(ok({ user: { ...sampleUser, name: 'Baru' } }, 'Diubah'))
    await renderWithProviders(ProfilePage, withProfile)
    await fireEvent.update(screen.getByLabelText('Nama'), 'Baru')
    await fireEvent.update(screen.getByLabelText('Email'), 'baru@delcom.org')
    await fireEvent.submit(screen.getByRole('button', { name: 'Simpan profil' }))
    await waitFor(() => expect(tools.showSuccessDialog).toHaveBeenCalledWith('Diubah'))
    expect(api.updateMeApi).toHaveBeenCalledWith({ name: 'Baru', email: 'baru@delcom.org' })

    vi.mocked(api.updateMeApi).mockRejectedValueOnce(new Error('invalid'))
    await fireEvent.submit(screen.getByRole('button', { name: 'Simpan profil' }))
    await waitFor(() => expect(tools.showErrorDialog).toHaveBeenCalledWith('invalid'))
  })

  it('mengunggah foto: tanpa file, sukses, dan gagal', async () => {
    await renderWithProviders(ProfilePage, withProfile)
    const input = screen.getByLabelText('Ganti foto')
    await fireEvent.change(input, { target: { files: [] } })
    expect(api.uploadPhotoApi).not.toHaveBeenCalled()

    const file = new File(['x'], 'p.png', { type: 'image/png' })
    vi.mocked(api.uploadPhotoApi).mockResolvedValueOnce(ok(null, 'Foto diubah'))
    vi.mocked(api.getMeApi).mockResolvedValueOnce(ok({ user: sampleUser }))
    await fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => expect(tools.showSuccessDialog).toHaveBeenCalledWith(expect.any(String)))
    expect(api.uploadPhotoApi).toHaveBeenCalledWith(file)

    vi.mocked(api.uploadPhotoApi).mockRejectedValueOnce(new Error('file besar'))
    await fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => expect(tools.showErrorDialog).toHaveBeenCalledWith('file besar'))
  })

  it('mengubah kata sandi: gagal (form tetap) lalu sukses (form dikosongkan)', async () => {
    await renderWithProviders(ProfilePage, withProfile)
    await fireEvent.update(screen.getByLabelText('Kata sandi saat ini'), 'lama123')
    await fireEvent.update(screen.getByLabelText('Kata sandi baru'), 'baru123')
    await fireEvent.update(screen.getByLabelText('Konfirmasi kata sandi baru'), 'baru123')

    vi.mocked(api.changePasswordApi).mockRejectedValueOnce(new Error('sandi salah'))
    await fireEvent.submit(screen.getByRole('button', { name: 'Ubah kata sandi' }))
    await waitFor(() => expect(tools.showErrorDialog).toHaveBeenCalledWith('sandi salah'))
    expect((screen.getByLabelText('Kata sandi saat ini') as HTMLInputElement).value).toBe('lama123')

    vi.mocked(api.changePasswordApi).mockResolvedValueOnce(ok(null, 'Sandi diubah'))
    await fireEvent.submit(screen.getByRole('button', { name: 'Ubah kata sandi' }))
    await waitFor(() => expect(tools.showSuccessDialog).toHaveBeenCalledWith('Sandi diubah'))
    await waitFor(() => expect((screen.getByLabelText('Kata sandi saat ini') as HTMLInputElement).value).toBe(''))
    expect(api.changePasswordApi).toHaveBeenLastCalledWith({
      password: 'lama123',
      new_password: 'baru123',
      new_password_confirmation: 'baru123',
    })
  })
})

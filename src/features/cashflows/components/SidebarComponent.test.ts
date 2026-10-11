import { fireEvent, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../../test-utils'
import SidebarComponent from './SidebarComponent.vue'

describe('SidebarComponent', () => {
  it('menampilkan menu navigasi', async () => {
    await renderWithProviders(SidebarComponent, { props: { open: false } })
    expect(screen.getByText('Ringkasan Arus Kas')).toHaveAttribute('href', '/')
    expect(screen.getByText('Direktori Pengguna')).toHaveAttribute('href', '/users')
    expect(screen.getByText('Profil Saya')).toHaveAttribute('href', '/profile')
  })

  it('mengatur visibilitas berdasarkan prop open', async () => {
    const { rerender } = await renderWithProviders(SidebarComponent, { props: { open: false } })
    expect(screen.getByTestId('sidebar')).toHaveClass('-translate-x-full')
    await rerender({ open: true })
    expect(screen.getByTestId('sidebar')).toHaveClass('translate-x-0')
  })

  it('mengirim event close saat menu diklik', async () => {
    const { emitted, router } = await renderWithProviders(SidebarComponent, { props: { open: true } })
    await fireEvent.click(screen.getByText('Profil Saya'))
    expect(emitted()).toHaveProperty('close')
    await router.isReady()
  })
})

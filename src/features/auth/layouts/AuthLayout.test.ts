import { screen, waitFor } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { putAccessToken } from '../../../helpers/apiHelper'
import { renderWithProviders } from '../../../test-utils'
import AuthLayout from './AuthLayout.vue'

describe('AuthLayout', () => {
  it('menampilkan shell autentikasi', async () => {
    const { router } = await renderWithProviders(AuthLayout, { route: '/auth/login' })
    expect(screen.getByText('Delcom Cash Flow')).toBeInTheDocument()
    expect(router.currentRoute.value.path).toBe('/auth/login')
  })

  it('mengalihkan ke beranda bila sudah login', async () => {
    putAccessToken('tok')
    const { router } = await renderWithProviders(AuthLayout, { route: '/auth/login' })
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/'))
  })
})

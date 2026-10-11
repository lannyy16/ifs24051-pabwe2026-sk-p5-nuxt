
import { screen, waitFor } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import AuthLayout from './AuthLayout.vue'
import { renderWithProviders } from '../../../test-utils'
import { putAccessToken } from '../../../helpers/apiHelper'

describe('AuthLayout', () => {
  it('menampilkan shell autentikasi', async () => {
    await renderWithProviders(AuthLayout, {
      route: '/auth/login',
      routes: [
        {
          path: '/auth/login',
          component: {
            template: '<div data-testid="blank"></div>',
          },
        },
      ],
    })

    expect(screen.getByText('Delcom Cash Flow')).toBeInTheDocument()
    expect(screen.getByTestId('blank')).toBeInTheDocument()
  })

  it('mengalihkan ke dashboard bila sudah login', async () => {
    putAccessToken('tok')

    const { router } = await renderWithProviders(AuthLayout, {
      route: '/auth/login',
      routes: [
        {
          path: '/auth/login',
          component: AuthLayout,
        },
        {
          path: '/cashflows',
          component: {
            template: '<div>Dashboard</div>',
          },
        },
      ],
    })

    await waitFor(() => {
      expect(router.currentRoute.value.fullPath).toBe('/cashflows')
    })
  })
})

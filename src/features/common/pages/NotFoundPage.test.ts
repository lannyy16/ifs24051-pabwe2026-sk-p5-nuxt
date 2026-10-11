import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../../test-utils'
import NotFoundPage from './NotFoundPage.vue'

describe('NotFoundPage', () => {
  it('menampilkan 404 dan tautan kembali', async () => {
    await renderWithProviders(NotFoundPage)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Kembali ke beranda')).toHaveAttribute('href', '/')
  })
})

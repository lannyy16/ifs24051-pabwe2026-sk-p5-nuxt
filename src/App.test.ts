import { screen } from '@testing-library/vue'
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import App from './app.vue'
import { renderWithProviders } from './test-utils'

describe('App', () => {
  it('merender RouterView sesuai rute aktif', async () => {
    const Home = defineComponent({ render: () => h('p', 'Halaman Uji') })
    await renderWithProviders(App, { route: '/', routes: [{ path: '/', component: Home }] })
    expect(screen.getByText('Halaman Uji')).toBeInTheDocument()
  })
})


import { render, screen } from '@testing-library/vue'
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import PublicHomePage from './PublicHomePage.vue'

const RouterLinkStub = defineComponent({
  props: {
    to: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'a',
        {
          href: props.to,
          'data-to': props.to,
        },
        slots.default?.(),
      )
  },
})

const renderPage = () =>
  render(PublicHomePage, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  })

describe('PublicHomePage', () => {
  it('menampilkan judul dan deskripsi aplikasi', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { name: 'Delcom Cash Flow' }),
    ).toBeInTheDocument()

    expect(screen.getByText('Kelola Keuanganmu')).toBeInTheDocument()

    expect(
      screen.getByText(/Catat pemasukan dan pengeluaran/),
    ).toBeInTheDocument()
  })

  it('menampilkan tautan login dan registrasi dengan tujuan yang benar', () => {
    renderPage()

    expect(
      screen.getByRole('link', { name: /Mulai Sekarang/ }),
    ).toHaveAttribute('href', '/auth/login')

    expect(
      screen.getByRole('link', { name: /Buat Akun/ }),
    ).toHaveAttribute('href', '/auth/register')
  })

  it('menampilkan kedua fitur utama aplikasi', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { name: 'Pencatatan Arus Kas' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: 'Pantau Keuangan' }),
    ).toBeInTheDocument()
  })
})

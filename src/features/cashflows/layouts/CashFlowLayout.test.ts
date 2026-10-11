import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import CashFlowLayout from './CashFlowLayout.vue'

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  fetchProfile: vi.fn(),
  clearSession: vi.fn(),
  getAccessToken: vi.fn(),
}))

vi.mock('vue-router', () => ({
  RouterView: {
    name: 'RouterView',
    template: '<div data-testid="router-view"></div>',
  },
  useRouter: () => ({
    replace: mocks.replace,
  }),
}))

vi.mock('../../../helpers/apiHelper', () => ({
  getAccessToken: mocks.getAccessToken,
}))

vi.mock('../../auth/states/authStore', () => ({
  useAuthStore: () => ({
    clearSession: mocks.clearSession,
  }),
}))

vi.mock('../../users/states/usersStore', () => ({
  useUsersStore: () => ({
    fetchProfile: mocks.fetchProfile,
  }),
}))

vi.mock('../components/NavbarComponent.vue', () => ({
  default: {
    name: 'NavbarComponent',
    emits: ['toggle-sidebar'],
    template: `
      <button
        data-testid="toggle-sidebar"
        @click="$emit('toggle-sidebar')"
      >
        Toggle Sidebar
      </button>
    `,
  },
}))

vi.mock('../components/SidebarComponent.vue', () => ({
  default: {
    name: 'SidebarComponent',
    props: ['open'],
    emits: ['close'],
    template: `
      <div data-testid="sidebar">
        <span data-testid="sidebar-state">{{ open }}</span>
        <button data-testid="close-sidebar" @click="$emit('close')">
          Close
        </button>
      </div>
    `,
  },
}))

describe('CashFlowLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessToken.mockReturnValue('test-token')
    mocks.fetchProfile.mockResolvedValue(true)
    mocks.replace.mockResolvedValue(undefined)
  })

  it('mengarahkan ke login jika token tidak tersedia', async () => {
    mocks.getAccessToken.mockReturnValue(null)

    const wrapper = mount(CashFlowLayout)
    await flushPromises()

    expect(mocks.replace).toHaveBeenCalledWith('/auth/login')
    expect(mocks.fetchProfile).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('menampilkan layout jika profil valid', async () => {
    const wrapper = mount(CashFlowLayout)
    await flushPromises()

    expect(mocks.fetchProfile).toHaveBeenCalledOnce()
    expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="toggle-sidebar"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true)
    expect(mocks.clearSession).not.toHaveBeenCalled()
    expect(mocks.replace).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('menghapus sesi dan mengarahkan ke login jika profil tidak valid', async () => {
    mocks.fetchProfile.mockResolvedValue(false)

    const wrapper = mount(CashFlowLayout)
    await flushPromises()

    expect(mocks.clearSession).toHaveBeenCalledOnce()
    expect(mocks.replace).toHaveBeenCalledWith('/auth/login')
    expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('menghapus sesi dan mengarahkan ke login jika pengambilan profil gagal', async () => {
    mocks.fetchProfile.mockRejectedValue(new Error('Gagal mengambil profil'))

    const wrapper = mount(CashFlowLayout)
    await flushPromises()

    expect(mocks.clearSession).toHaveBeenCalledOnce()
    expect(mocks.replace).toHaveBeenCalledWith('/auth/login')
    expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('membuka dan menutup sidebar', async () => {
    const wrapper = mount(CashFlowLayout)
    await flushPromises()

    expect(wrapper.find('[data-testid="sidebar-state"]').text()).toBe('false')

    await wrapper.find('[data-testid="toggle-sidebar"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="sidebar-state"]').text()).toBe('true')

    await wrapper.find('[data-testid="close-sidebar"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="sidebar-state"]').text()).toBe('false')

    wrapper.unmount()
  })
})
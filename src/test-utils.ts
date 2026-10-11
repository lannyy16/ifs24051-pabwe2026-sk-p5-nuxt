import { render } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import type { Component } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const Blank = defineComponent({ name: 'Blank', render: () => h('div', { 'data-testid': 'blank' }) })

/** Pinia asli (bukan stub) dengan state awal per-store yang di-patch saat store dibuat. */
export function createMockPinia(initialState: Record<string, Record<string, unknown>> = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  pinia.use(({ store }) => {
    const initial = initialState[store.$id]
    if (initial) store.$patch(initial)
  })
  return pinia
}

interface RenderOptions {
  props?: Record<string, unknown>
  route?: string
  routes?: RouteRecordRaw[]
  initialState?: Record<string, Record<string, unknown>>
  slots?: Record<string, string>
}

/** Render komponen dengan Pinia Store dan Memory Router. */
export async function renderWithProviders(component: Component, options: RenderOptions = {}) {
  const { props, route = '/', routes = [], initialState, slots } = options
  const pinia = createMockPinia(initialState)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [...routes, { path: '/:pathMatch(.*)*', component: Blank }],
  })
  await router.push(route)
  await router.isReady()
  const result = render(component, { props, slots, global: { plugins: [pinia, router] } })
  return { ...result, router, pinia }
}

export const sampleCashFlow = {
  id: 7,
  user_id: 1,
  type: 'outflow' as const,
  source: 'savings' as const,
  label: 'alat-elektronik',
  description: 'Membeli keyboard',
  nominal: 400000,
  created_at: '2024-10-05T12:09:16.000000Z',
  updated_at: '2024-10-06T12:09:16.000000Z',
}

export const sampleInflow = { ...sampleCashFlow, id: 8, type: 'inflow' as const, source: 'cash' as const, label: 'gaji' }

export const sampleUser = { id: 1, name: 'Delcom Testing', email: 'testing@delcom.org', photo: null }

export const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

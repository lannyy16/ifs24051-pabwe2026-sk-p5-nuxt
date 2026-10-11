import { describe, expect, it } from 'vitest'
import type { RouteRecordRaw } from 'vue-router'
import routerOptions from './router.options'
import { routes } from './routes'

type Lazy = () => Promise<unknown>

function collect(list: RouteRecordRaw[]): RouteRecordRaw[] {
  return list.flatMap((route) => [route, ...collect(route.children ?? [])])
}

describe('router.options', () => {
  it('memakai deklarasi rute dari routes.ts', () => {
    expect((routerOptions.routes as () => unknown)()).toBe(routes)
  })

  it('mendeklarasikan seluruh rute yang diminta', () => {
    const paths = collect(routes).map((route) => route.path)
    expect(paths).toEqual(
      expect.arrayContaining(['/auth', 'login', 'register', '/', 'cash-flows/:cashFlowId', 'users', 'profile', '/:pathMatch(.*)*']),
    )
  })

  it('seluruh komponen rute dapat dimuat secara lazy', async () => {
    const loaders = collect(routes)
      .map((route) => route.component as Lazy | undefined)
      .filter((loader): loader is Lazy => !!loader)
    expect(loaders).toHaveLength(9)
    const modules = (await Promise.all(loaders.map((load) => load()))) as { default: unknown }[]
    modules.forEach((module) => expect(module.default).toBeDefined())
  })
})

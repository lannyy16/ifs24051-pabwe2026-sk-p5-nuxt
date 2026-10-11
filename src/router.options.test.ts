
import { describe, expect, it } from 'vitest'
import routerOptions from './router.options'
import { routes } from './routes'

type Lazy = () => Promise<unknown>

function collect(records: typeof routes): typeof routes {
  return records.flatMap((route) => [
    route,
    ...collect((route.children ?? []) as typeof routes),
  ])
}

describe('router.options', () => {
  it('memakai deklarasi rute dari routes.ts', () => {
    expect(routerOptions.routes?.()).toBe(routes)
  })

  it('mendeklarasikan seluruh rute yang diminta', () => {
    const paths = collect(routes).map((route) => route.path)

    expect(paths).toEqual(
      expect.arrayContaining([
        '/',
        '/auth',
        'login',
        'register',
        'cashflows',
        'cashflows/:cashFlowId',
        'users',
        'profile',
        '/:pathMatch(.*)*',
      ]),
    )
  })

  it('seluruh komponen rute dapat dimuat secara lazy', async () => {
    const loaders = collect(routes)
      .map((route) => route.component as Lazy | undefined)
      .filter((loader): loader is Lazy => !!loader)

    expect(loaders).toHaveLength(10)

    const modules = await Promise.all(loaders.map((loader) => loader()))
    modules.forEach((module) => {
      expect(module).toBeDefined()
    })
  })
})

import tailwindcss from '@tailwindcss/vite'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DEFAULT_BASEURL = 'https://open-api.delcom.org/api/v1'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false, // SPA mode
  srcDir: 'src/',
  pages: true, // rute dideklarasikan di src/routes.ts melalui src/router.options.ts
  modules: ['@pinia/nuxt'],
  css: ['~/index.css'],
  devtools: { enabled: false },
  telemetry: false,
  sourcemap: { client: true, server: false },
  devServer: {
    port: Number(process.env.APP_PORT) || 3000,
  },
  vite: {
    plugins: [tailwindcss()],
    define: {
      // variabel lingkungan global (lihat src/env.d.ts)
      DELCOM_BASEURL: JSON.stringify(process.env.VITE_DELCOM_BASEURL || DEFAULT_BASEURL),
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
  },
  routeRules: {
    // Hindari Cache-Control: no-store agar halaman memenuhi syarat back/forward cache (bfcache).
    '/**': { headers: { 'cache-control': 'public, max-age=0, must-revalidate' } },
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },
  nitro: {
    devPort: Number(process.env.APP_PORT) || 3000,
    externals: { inline: ['@vue/shared'] },
    // Prerender halaman SPA agar index.html statis (CDN) dan CSS bisa di-inline.
    prerender: { routes: ['/', '/auth/login'], failOnError: false },
    hooks: {
      // Inline entry CSS ke <style> agar tidak menjadi render-blocking request.
      'prerender:generate'(route, nitro) {
        if (!route.fileName?.endsWith('.html') || typeof route.contents !== 'string') return
        // Saat prerender, .output/public belum terisi; baca dari direktori aset client build.
        const dirs = nitro.options.publicAssets.map((asset) => asset.dir)
        route.contents = route.contents.replace(
          /<link rel="stylesheet" href="(\/_nuxt\/entry\.[^"]+\.css)"[^>]*>/g,
          (tag: string, href: string) => {
            const name = href.split('/').pop() as string
            const file = dirs.map((dir) => join(dir, name)).find((candidate) => existsSync(candidate))
            if (!file) return tag
            // url() relatif (font) harus menjadi absolut karena CSS kini berada di dalam HTML.
            const css = readFileSync(file, 'utf8').replaceAll('url(./', 'url(/_nuxt/')
            return `<style>${css}</style>`
          },
        )
      },
    },
  },
  app: {
    head: {
      title: 'Delcom Cash Flow',
      htmlAttrs: { lang: 'id' },
      meta: [
        {
          name: 'description',
          content:
            'Delcom Cash Flow: aplikasi pencatat pemasukan dan pengeluaran, pantau saldo kas, tabungan, dan pinjaman.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
      ],
    },
  },
})

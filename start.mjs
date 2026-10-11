// Preview launcher: membaca APP_PORT dari .env lalu menjalankan `nuxt preview`.
// Jalankan `bun run build` terlebih dahulu agar folder .output tersedia.
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function readEnv(file) {
  const env = {}
  if (!existsSync(file)) return env
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/)
    if (match && !line.trim().startsWith('#')) env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
  }
  return env
}

const env = { ...readEnv(resolve(process.cwd(), '.env')), ...process.env }
const port = env.APP_PORT || env.PORT || '3000'

console.log(`Delcom Cash Flow preview berjalan di http://localhost:${port}`)

// `npx` memakai runtime Node (didukung penuh oleh Nuxt) dan bekerja di Windows/Linux/macOS.
const child = spawn('npx', ['nuxt', 'preview', '--port', port], {
  stdio: 'inherit',
  // Host lewat environment (bukan flag --host) agar tidak terbaca sebagai argumen path oleh CLI.
  env: { ...env, APP_PORT: port, PORT: port, HOST: '0.0.0.0', NITRO_HOST: '0.0.0.0' },
  shell: true,
})
child.on('exit', (code) => process.exit(code ?? 0))


import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const getTaiwanBuildDateLabel = (): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(new Date())
  const year = Number(parts.find((p) => p.type === 'year')?.value ?? new Date().getFullYear())
  const month = parts.find((p) => p.type === 'month')?.value ?? '01'
  const day = parts.find((p) => p.type === 'day')?.value ?? '01'
  const rocYear = year - 1911
  return `系統於 ${rocYear} 年 ${month} 月 ${day} 日更新`
}

const getBuildId = (): string => {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
  const commit = env?.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || 'build'
  return `${commit}-${Date.now()}`
}

const APP_BUILD_ID = getBuildId()

const emitVersionJsonPlugin = (buildId: string): Plugin => ({
  name: 'emit-version-json',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify({ buildId }),
    })
  },
  configureServer(server) {
    server.middlewares.use('/version.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.end(JSON.stringify({ buildId }))
    })
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), emitVersionJsonPlugin(APP_BUILD_ID)],
  define: {
    __SYSTEM_LAST_UPDATED__: JSON.stringify(getTaiwanBuildDateLabel()),
    __APP_BUILD_ID__: JSON.stringify(APP_BUILD_ID),
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
  },
})

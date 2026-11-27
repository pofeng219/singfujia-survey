
import { defineConfig } from 'vite'
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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __SYSTEM_LAST_UPDATED__: JSON.stringify(getTaiwanBuildDateLabel()),
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
  },
})

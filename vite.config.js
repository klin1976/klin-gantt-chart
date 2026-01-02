import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/klin-gantt-chart/', // 這裡要跟您的專案名稱一致
})

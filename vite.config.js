import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/klin-gantt-chart/', // 這裡要跟您的專案名稱一致
  resolve: {
    alias: {
      'prop-types': path.resolve(__dirname, './src/utils/prop-types-mock.js')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
  }
})

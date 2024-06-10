/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import eslint from 'vite-plugin-eslint'
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), eslint({fix: true})],
  test: {
    setupFiles: ['tests/unit.setup.ts'],
    environment: "jsdom"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src'),
      "primevue/menuitem": "node_modules/primevue/menuitem"
    }
  }
})

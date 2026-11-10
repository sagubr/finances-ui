import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const readVersion = (pkgPath: string): string | null => {
  if (!existsSync(pkgPath)) return null
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version?: string }
  return pkg.version ? String(pkg.version) : null
}

const getAppVersion = (): string => {
  try {
    return (
      readVersion(resolve(process.cwd(), 'package.json')) ??
      readVersion(resolve(process.cwd(), '../../package.json')) ??
      '0.1.0'
    )
  } catch {
    // fallback seguro
    return '0.1.0'
  }
}

export default defineConfig(({ mode }) => ({
  cacheDir: 'node_modules/.vite-finances',
  build: {
    chunkSizeWarningLimit: 2600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/node-sql-parser')) {
            return 'vendor-sql-parser'
          }
          if (id.includes('node_modules/@react-pdf')) {
            return 'vendor-pdf'
          }
          if (
            id.includes('node_modules/@codemirror') ||
            id.includes('node_modules/@uiw/react-codemirror')
          ) {
            return 'vendor-codemirror'
          }
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/@tanstack/')) {
            return 'vendor-tanstack'
          }
        },
      },
    },
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(getAppVersion()),
    'import.meta.env.VITE_APP_ENV': JSON.stringify(mode),
  },
  plugins: [
    devtools(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'site.webmanifest',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/assets\//, /\.[a-zA-Z0-9]+$/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      manifest: {
        id: '/',
        name: 'Nummo',
        short_name: 'Nummo',
        description: 'Suas finanças, com tranquilidade.',
        lang: 'pt-BR',
        theme_color: '#1E7B50',
        background_color: '#F4FBF7',
        display: 'standalone',
        orientation: 'any',
        categories: ['finance', 'productivity'],
        scope: '/',
        start_url: '/home?source=pwa',
        shortcuts: [
          {
            name: 'Início',
            short_name: 'Início',
            url: '/home?source=pwa-shortcut',
            icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Transações',
            short_name: 'Transações',
            url: '/transactions?source=pwa-shortcut',
            icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Relatórios',
            short_name: 'Relatórios',
            url: '/reports?source=pwa-shortcut',
            icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/maskable-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/maskable-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: false,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      { find: '#', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
    },
  },
}))

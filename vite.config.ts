import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(({command}) => {
  const rootDir = import.meta.dirname;
  const isBuild = command === 'build';
  return {
    base: isBuild ? './' : '/',
    plugins: [
      react(),
      tailwindcss(),
      ...(!isBuild
        ? [
            {
              name: 'cleanup-stale-dev-sw',
              configureServer(server: {
                middlewares: {
                  use: (
                    fn: (
                      req: {url?: string},
                      res: {
                        setHeader: (k: string, v: string) => void;
                        end: (body: string) => void;
                      },
                      next: () => void,
                    ) => void,
                  ) => void;
                };
              }) {
                server.middlewares.use((req, res, next) => {
                  const reqUrl = req.url || '';
                  if (reqUrl.startsWith('/dev-sw.js') || reqUrl.startsWith('/sw.js')) {
                    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
                    res.setHeader('Cache-Control', 'no-store');
                    res.end(
                      `self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', async () => {
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));
  await self.registration.unregister();
});`,
                    );
                    return;
                  }
                  next();
                });
              },
            },
          ]
        : [
            VitePWA({
              registerType: 'autoUpdate',
              includeAssets: [
                'apple-touch-icon.png',
                'pwa-192x192.png',
                'pwa-512x512.png',
                'pwa-maskable-512x512.png',
                'assets/aistudio/a______________________11e307c1.webp',
                'data/ajwibah.json',
              ],
              manifest: {
                id: './',
                name: 'اجوبة‌الاستفتائات — شهید آیت‌الله خامنه‌ای',
                short_name: 'اجوبة‌الاستفتائات',
                description:
                  'اپلیکیشن جامع ۲٬۱۱۸ استفتاء شرعی از کتاب اجوبة‌الاستفتائات شهید آیت‌الله سید علی خامنه‌ای (قدس‌الله‌نفسه‌الزکیه)',
                theme_color: '#0E5C31',
                background_color: '#F8F5EE',
                display: 'standalone',
                display_override: ['standalone', 'minimal-ui'],
                orientation: 'portrait',
                dir: 'rtl',
                lang: 'fa',
                start_url: './',
                scope: './',
                prefer_related_applications: false,
                categories: ['books', 'education', 'reference'],
                icons: [
                  {
                    src: 'pwa-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any',
                  },
                  {
                    src: 'pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any',
                  },
                  {
                    src: 'pwa-maskable-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable',
                  },
                ],
              },
              workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json,woff2}'],
                globIgnores: ['**/*.pdf'],
                maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
                runtimeCaching: [
                  {
                    urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                    handler: 'CacheFirst',
                    options: {
                      cacheName: 'google-fonts-css',
                      expiration: {
                        maxEntries: 10,
                        maxAgeSeconds: 60 * 60 * 24 * 365,
                      },
                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },
                  {
                    urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                    handler: 'CacheFirst',
                    options: {
                      cacheName: 'google-fonts-woff',
                      expiration: {
                        maxEntries: 30,
                        maxAgeSeconds: 60 * 60 * 24 * 365,
                      },
                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },
                ],
              },
            }),
          ]),
      // Copies src/assets into dist/ so root-relative URLs still resolve in production builds.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(rootDir, 'dist');
          const srcAssets = path.resolve(rootDir, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'react-vendor',
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                priority: 20,
              },
              {
                name: 'icons-vendor',
                test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
                priority: 15,
              },
            ],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': rootDir,
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

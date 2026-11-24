import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

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
        : []),
      // Copies src/assets into dist/ so root-relative URLs still resolve in offline APK builds.
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

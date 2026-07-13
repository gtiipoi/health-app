import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  const isStandalone = mode === 'standalone';

  const plugins: any[] = [react()];

  if (isStandalone) {
    // Single file build - no PWA (SW doesn't work on file://)
    plugins.push(viteSingleFile());
  } else {
    // Full PWA build
    plugins.push(
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
        manifest: {
          name: '轻享健康 - 饮食热量管理',
          short_name: '轻享健康',
          description: '免费健康管理应用 - 热量查询、体重管理、运动记录',
          theme_color: '#22c55e',
          background_color: '#f0fdf4',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      })
    );
  }

  return {
    plugins,
    base: './',
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
    build: {
      target: 'es2020',
    },
  };
});

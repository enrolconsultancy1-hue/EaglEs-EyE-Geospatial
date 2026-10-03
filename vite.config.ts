import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import cesium from 'vite-plugin-cesium';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const serverPort = parseInt(env.PORT || '3001', 10);
  const clientPort = parseInt(env.CLIENT_PORT || '5173', 10);

  return {
    plugins: [cesium()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@server': path.resolve(__dirname, './server'),
      },
    },
    define: {
      'import.meta.env.CESIUM_ION_TOKEN': JSON.stringify(
        env.CESIUM_ION_TOKEN || '',
      ),
      'import.meta.env.GOOGLE_MAPS_API_KEY': JSON.stringify(
        env.GOOGLE_MAPS_API_KEY || '',
      ),
    },
    server: {
      port: clientPort,
      host: env.HOST || 'localhost',
      proxy: {
        '/api': {
          target: `http://localhost:${serverPort}`,
          changeOrigin: true,
          secure: false,
        },
      },
      headers: {
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "frame-ancestors 'none'",
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      outDir: 'dist',
    },
  };
});

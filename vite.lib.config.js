/**
 * Vite Library Build Config
 *
 * Builds the @lenslearn/ui component library as a distributable package.
 * Usage: npm run build:lib
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/lib/index.js'),
        components: resolve(__dirname, 'src/lib/components/index.js'),
        hooks: resolve(__dirname, 'src/lib/hooks/index.js'),
        tokens: resolve(__dirname, 'src/lib/tokens/index.js'),
        animations: resolve(__dirname, 'src/lib/animations/index.js'),
        utils: resolve(__dirname, 'src/lib/utils/index.js'),
        hoc: resolve(__dirname, 'src/lib/hoc/index.jsx'),
        providers: resolve(__dirname, 'src/lib/providers/index.js'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-markdown',
        'lucide-react',
      ],
      output: {
        dir: 'dist-lib',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
});

import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// Post-process: catches any ?? that slipped through Babel's AST handoff
function patchNullishCoalescing() {
  return {
    name: 'patch-nullish-coalescing',
    apply: 'build',
    enforce: 'post',
    async generateBundle(_, bundle) {
      for (const [, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk' || !chunk.code.includes('??')) continue;
        try {
          const result = await transformWithEsbuild(chunk.code, 'chunk.js', { target: 'es2015', minify: false });
          chunk.code = result.code;
        } catch (e) { /* never break the build */ }
      }
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    // renderModernChunks:false → Babel transpila TODO para iOS 12+
    legacy({
      targets: ['ios >= 12', 'safari >= 12', 'chrome >= 71', 'firefox >= 65'],
      renderModernChunks: false,
    }),
    patchNullishCoalescing(),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    // En desarrollo: "vercel dev" corre en :3000 y sirve /api/*
    // Con este proxy, "npm run dev" también puede llamar a /api/gifs, /api/chat, etc.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({

  define: {

    __isProduction__: process.env.NODE_ENV === 'production'

  },

  plugins: [

    vue()

  ],

  base: './',

  build: {

    outDir: 'docs',

  },

  server: {

    port: 3002,

    open: true,

    host: '0.0.0.0'

  }

})

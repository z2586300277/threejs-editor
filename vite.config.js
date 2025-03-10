import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({

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

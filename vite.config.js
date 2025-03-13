import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({

  define: {

    __isProduction__: process.env.NODE_ENV === 'production'

  },

  plugins: [
    {

      transformIndexHtml: html => {

        if (process.env.NODE_ENV === 'production') {

          html = html.replace(/<head>/, `<head>\n
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8697430839896878" crossorigin="anonymous"></script> 
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-LKJQBJNGVF"></script>
          <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-LKJQBJNGVF');
          </script>
          <script>
            var _hmt = _hmt || [];
            (function() {
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?85aef82369b0fe002f0e62a775344e89";
              var s = document.getElementsByTagName("script")[0]; 
              s.parentNode.insertBefore(hm, s);
            })();
            </script>
          `)

        }

        return html

      }
    },

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

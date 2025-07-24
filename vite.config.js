import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/FrontTestingService-auth': {
        target: 'http://91.220.155.234:8080',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/FrontTestingService-auth/, '/FrontTestingService-auth'),
        cookieDomainRewrite: {
          '*': 'localhost'
        },
        cookiePathRewrite: {
          '*': '/'
        },
        headers: {
          Connection: 'keep-alive'
        },
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response headers:', proxyRes.headers);
            const setCookieHeaders = proxyRes.headers['set-cookie'];
            if (setCookieHeaders) {
              console.log('Original Set-Cookie:', setCookieHeaders);
              const adaptedCookies = setCookieHeaders.map(cookie => 
                cookie
                  .replace(/; Secure/gi, '')
                  .replace(/; HttpOnly/gi, '')
                  .replace(/; SameSite=\w+/gi, '')
                  .replace(/domain=\S+;/gi, 'domain=localhost;')
              );
              console.log('Adapted Set-Cookie:', adaptedCookies);
              proxyRes.headers['set-cookie'] = adaptedCookies;
            }
          });
        }
      },
      '/FrontTestingService-back': {
        target: 'http://91.220.155.234:8080',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: {
          '*': 'localhost'
        },
        cookiePathRewrite: {
          '*': '/'
        }
      }
    }
  }
})
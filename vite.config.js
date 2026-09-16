import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

const rewriteCleanPageUrls = (req, _res, next) => {
  const cleanPage = (req.url || '').match(/^\/(portfolio|resume)\/?(?:[?#].*)?$/)
  if (cleanPage) {
    req.url = req.url.replace(new RegExp(`^/${cleanPage[1]}/?`), `/${cleanPage[1]}.html`)
  }
  next()
}

const cleanPageRoutes = {
  name: 'clean-page-routes',
  configureServer(server) {
    server.middlewares.use(rewriteCleanPageUrls)
  },
  configurePreviewServer(server) {
    server.middlewares.use(rewriteCleanPageUrls)
  }
}

export default defineConfig({
  plugins: [cleanPageRoutes],
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        portfolio: fileURLToPath(new URL('./portfolio.html', import.meta.url)),
        resume: fileURLToPath(new URL('./resume.html', import.meta.url))
      }
    }
  }
})

import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

const rewriteCleanPortfolioUrl = (req, _res, next) => {
  if (/^\/portfolio\/?(?:[?#].*)?$/.test(req.url || '')) {
    req.url = req.url.replace(/^\/portfolio\/?/, '/portfolio.html')
  }
  next()
}

const cleanPortfolioRoute = {
  name: 'clean-portfolio-route',
  configureServer(server) {
    server.middlewares.use(rewriteCleanPortfolioUrl)
  },
  configurePreviewServer(server) {
    server.middlewares.use(rewriteCleanPortfolioUrl)
  }
}

export default defineConfig({
  plugins: [cleanPortfolioRoute],
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        portfolio: fileURLToPath(new URL('./portfolio.html', import.meta.url))
      }
    }
  }
})

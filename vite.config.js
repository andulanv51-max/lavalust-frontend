import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'https://andulan-veronica-lavalust.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },

    configureServer(server) {
      server.middlewares.use('/api', (req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, DELETE, OPTIONS'
          )
          res.setHeader(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, Accept'
          )
          res.end()
          return
        }

        next()
      })
    },
  },
})
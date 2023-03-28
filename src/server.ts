import fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import path from 'path'

import { appRoutes } from './routes'

const app = fastify()

app.register(cors)
app.register(fastifyJwt, {
  secret: String(process.env.JWT_SECRET),
})
app.register(appRoutes)

app.register(require('@fastify/static'), {
  root: path.join(__dirname, '..', 'tmp'),
  prefix: '/images/',
})

app
  .listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
  })
  .then(() => {
    console.log('HTTP Server runing')
  })

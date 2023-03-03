import fastify from 'fastify'
import cors from '@fastify/cors'

import { appRoutes } from './routes'

const app = fastify()

app.register(cors)
app.register(appRoutes)

app
  .listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
  })
  .then(() => {
    console.log('HTTP Server runing')
  })

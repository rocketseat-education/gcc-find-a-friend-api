import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { PrismaClient } from '@prisma/client'
import { parseQueryParams } from './utils/parseQueryParmas'
import { getBrasilCitysByState, getBrasilStates } from './lib/location'

const prismaClient = new PrismaClient()

interface QueryParamsProps {
  age: 'cub' | 'adolescent' | 'elderly'
  energy: number
  independence: 'low' | 'medium' | 'high'
  size: 'small' | 'medium' | 'big'
}

export async function appRoutes(app: FastifyInstance) {
  app.get('/pets/:city', async (request, reply) => {
    const requestParamsSchema = z.object({
      city: z.string(),
    })
    const { city } = requestParamsSchema.parse(request.params)

    const query = parseQueryParams<QueryParamsProps>(request.query)

    if (query.energy) {
      query.energy = Number(query.energy)
    }

    const pets = await prismaClient.pet.findMany({
      where: {
        city,
        ...query,
      },
    })

    return reply.send({ pets })
  })

  app.get('/location/states', async (request, reply) => {
    const states = await getBrasilStates()

    return reply.send({ states })
  })

  app.get('/location/citys/:UF', async (request, replay) => {
    const cityParmasSchema = z.object({
      UF: z.string(),
    })

    const { UF } = cityParmasSchema.parse(request.params)

    const citys = await getBrasilCitysByState(UF)

    return { citys }
  })
}

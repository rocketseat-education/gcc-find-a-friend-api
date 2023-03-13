import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { PrismaClient } from '@prisma/client'
import { parseQueryParams } from './utils/parseQueryParmas'
import { getBrasilCitysByState, getBrasilStates } from './lib/location'

const prismaClient = new PrismaClient()

interface QueryParamsProps {
  age?: 'cub' | 'adolescent' | 'elderly'
  energy?: number
  independence?: 'low' | 'medium' | 'high'
  size?: 'small' | 'medium' | 'big'
  type?: 'all' | 'dog' | 'cat'
}

export async function appRoutes(app: FastifyInstance) {
  app.get('/pets/:city', async (request, reply) => {
    const requestParamsSchema = z.object({
      city: z.string(),
    })
    const { city } = requestParamsSchema.parse(request.params)

    try {
      const query = parseQueryParams<QueryParamsProps>(request.query)

      if (query.energy) {
        query.energy = Number(query.energy)
      }

      if (query.type && query.type === 'all') {
        delete query.type
      }

      const pets = await prismaClient.pet.findMany({
        where: {
          city,
          ...query,
        },
      })

      return reply.send({
        pets: pets.map((pet) => ({
          ...pet,
          photo_url: `${process.env.APP_URL}/images/${pet.photo}`,
        })),
      })
    } catch {
      return reply.status(400).send({
        error: 'O parâmetros de busca são inválidos',
      })
    }
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

    try {
      const citys = await getBrasilCitysByState(UF)

      return { citys }
    } catch {
      return replay.status(404).send({
        error: 'Sigla de UF inválida',
      })
    }
  })
}

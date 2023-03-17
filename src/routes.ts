import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { PrismaClient } from '@prisma/client'
import { parseQueryParams } from './utils/parseQueryParmas'
import {
  getBrasilCitysByState,
  getBrasilStates,
  getGeoLocationByCEP,
} from './lib/location'

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

  app.get('/pets/show/:pet_id', async (request, reply) => {
    const showPetSchema = z.object({
      pet_id: z.string(),
    })

    const { pet_id } = showPetSchema.parse(request.params)

    try {
      const pet = await prismaClient.pet.findFirst({
        where: {
          id: pet_id,
        },
        include: {
          org: true,
        },
      })

      if (!pet) {
        return reply.status(404).send({ error: 'Pet não encontrado' })
      }

      return {
        pet: {
          ...pet,
          photo_url: `${process.env.APP_URL}/images/${pet?.photo}`,
          org: {
            id: pet?.org.id,
            nome: pet?.org.name,
            address: pet?.org.address,
            cep: pet?.org.cep,
            whatsappNumber: pet?.org.whatsappNumber,
          },
        },
      }
    } catch (error) {
      return reply.status(404).send({ error: 'Pet não encontrado' })
    }
  })

  app.get('/pets/gallery/:pet_id', async (request, reply) => {
    const galleryRequestParams = z.object({
      pet_id: z.string(),
    })

    const { pet_id } = galleryRequestParams.parse(request.params)

    try {
      const pet_gallery = await prismaClient.petGallery.findMany({
        where: {
          petId: pet_id,
        },
      })

      return {
        pet_gallery: pet_gallery.map((gallery) => ({
          ...gallery,
          photo_url: `${process.env.APP_URL}/images/${gallery.image}`,
        })),
      }
    } catch (error) {
      return reply.status(404).send({ error: 'galeria não encontrada' })
    }
  })

  app.get('/pets/adoption-requirements/:pet_id', async (request, reply) => {
    const requirementsParamsSchema = z.object({
      pet_id: z.string(),
    })

    const { pet_id } = requirementsParamsSchema.parse(request.params)

    try {
      const adoption_requirements =
        await prismaClient.adoptionRequirements.findMany({
          where: {
            petId: pet_id,
          },
        })

      return { adoption_requirements }
    } catch (error) {
      return reply.status(404).send({ error: 'Requisitos não encontrados' })
    }
  })

  app.get('/location/coordinates/:cep', async (request, reply) => {
    const coordinatesSchema = z.object({
      cep: z.string(),
    })

    const { cep } = coordinatesSchema.parse(request.params)

    try {
      const coordinates = await getGeoLocationByCEP(cep)

      return {
        coordinates,
      }
    } catch (error) {
      return reply
        .status(404)
        .send({ error: 'Não foi possível buscar as coordenadas' })
    }
  })

  app.get('/location/states', async (request, reply) => {
    const states = await getBrasilStates()

    return reply.send({ states })
  })

  app.get('/location/citys/:UF', async (request, reply) => {
    const cityParmasSchema = z.object({
      UF: z.string(),
    })

    const { UF } = cityParmasSchema.parse(request.params)

    try {
      const citys = await getBrasilCitysByState(UF)

      return { citys }
    } catch {
      return reply.status(404).send({
        error: 'Sigla de UF inválida',
      })
    }
  })
}

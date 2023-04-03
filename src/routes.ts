import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcryptjs from 'bcryptjs'

import { File } from 'fastify-multer/lib/interfaces'

import '@fastify/jwt'
import multer from 'fastify-multer'
import { PrismaClient } from '@prisma/client'
import { parseQueryParams } from './utils/parseQueryParmas'
import {
  getBrasilCitysByState,
  getBrasilStates,
  getGeoLocationByCEP,
} from './lib/location'
import { verifyJWT } from './middlewares'
import {
  PetAgeProps,
  PetIndependenceProps,
  PetSizeProps,
  PetTypeProps,
} from './pet-filter-types'

import uploadConfig from './config/upload'
import { titleize } from './utils/titleize'

declare module 'fastify' {
  export interface FastifyRequest {
    files: File[]
  }
}

const upload = multer(uploadConfig)

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    user: {
      sub: string
    } // user type is return type of `request.user` object
  }
}

const prismaClient = new PrismaClient()

interface QueryParamsProps {
  age?: PetAgeProps
  energy?: number
  independence?: PetIndependenceProps
  size?: PetSizeProps
  type?: PetTypeProps | 'all'
}

export async function appRoutes(app: FastifyInstance) {
  app.post(
    '/pets',
    { onRequest: verifyJWT, preHandler: upload.array('images', 6) },
    async (request, reply) => {
      try {
        const createPetBodySchema = z.object({
          name: z.string(),
          age: z.string(),
          size: z.string(),
          description: z.string(),
          energy: z.string(),
          independence: z.string(),
          type: z.string(),
          adoptionRequirements: z.string(),
        })

        const {
          adoptionRequirements,
          age,
          description,
          energy,
          independence,
          name,
          size,
          type,
        } = createPetBodySchema.parse(request.body)

        const orgId = request.user.sub

        const findOrg = await prismaClient.org.findFirst({
          where: {
            id: orgId,
          },
        })

        if (!findOrg) {
          return reply.status(404).send({
            error: 'ORG não encontrada',
          })
        }

        const parsedRequirement = JSON.parse(adoptionRequirements)

        if (parsedRequirement.length <= 0) {
          return reply
            .status(400)
            .send({ error: 'É necessário no mínimo 1 requisito de adoção' })
        }

        const images = request.files

        if (images.length <= 0) {
          return reply
            .status(400)
            .send({ error: 'É necessário no mínimo 1 imagem do pet' })
        }

        const photo = images[0].filename

        const { city } = await getGeoLocationByCEP(findOrg.cep)

        console.log(titleize(city))

        const pet = await prismaClient.pet.create({
          data: {
            age,
            city: titleize(city),
            description,
            energy: Number(energy),
            independence,
            name,
            photo: photo!,
            size,
            type,
            orgId,
          },
        })

        for await (const image of images) {
          await prismaClient.petGallery.create({
            data: {
              image: image.filename!,
              petId: pet.id,
            },
          })
        }

        for await (const requirement of parsedRequirement) {
          await prismaClient.adoptionRequirements.create({
            data: {
              petId: pet.id,
              title: requirement,
            },
          })
        }

        return reply.status(201).send()
      } catch (error) {
        return reply.status(400).send({
          error: 'Não foi possível cadastrar o Pet',
        })
      }
    },
  )

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
      const location = await getGeoLocationByCEP(cep)

      return location
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

  app.post('/auth/sessions', async (request, reply) => {
    const authenticationRequestSchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    const { email, password } = authenticationRequestSchema.parse(request.body)

    try {
      const org = await prismaClient.org.findFirst({
        where: {
          email,
        },
      })

      if (!org) {
        return reply.status(401).send({
          error: 'Credenciais inválidas',
        })
      }

      const passwordIsValid = await bcryptjs.compare(password, org.password)

      if (!passwordIsValid) {
        return reply.status(401).send({
          error: 'Credenciais inválidas',
        })
      }

      const token = await reply.jwtSign(
        {},
        {
          sign: {
            sub: org.id,
          },
        },
      )

      const refreshToken = await reply.jwtSign(
        {},
        {
          sign: {
            sub: org.id,
            expiresIn: '2d',
          },
        },
      )

      return reply
        .setCookie('refreshToken', refreshToken, {
          path: '/',
          secure: true,
          sameSite: true,
          httpOnly: true,
        })
        .status(200)
        .send({
          token,
          org: {
            id: org.id,
            nome: org.name,
            email: org.email,
            address: org.address,
            cep: org.cep,
            whatsappNumber: org.whatsappNumber,
          },
        })
    } catch (error) {
      return reply.status(401).send({
        error: 'Falha na autenticação',
      })
    }
  })

  app.patch('/auth/refresh-token', async (request, reply) => {
    try {
      await request.jwtVerify({ onlyCookie: true })

      const token = await reply.jwtSign(
        {},
        {
          sign: {
            sub: request.user.sub,
          },
        },
      )

      const refreshToken = await reply.jwtSign(
        {},
        {
          sign: {
            sub: request.user.sub,
            expiresIn: '2d',
          },
        },
      )

      return reply
        .setCookie('refreshToken', refreshToken, {
          path: '/',
          secure: true,
          sameSite: true,
          httpOnly: true,
        })
        .status(200)
        .send({
          token,
        })
    } catch (error) {
      return reply.status(401).send({
        error: 'Erro ao revalidar o token',
      })
    }
  })

  app.post('/orgs', async (request, reply) => {
    const createORGRequestParams = z.object({
      name: z.string(),
      email: z.string(),
      cep: z.string(),
      address: z.string(),
      whatsappNumber: z.string(),
      password: z.string(),
      passwordConfirm: z.string(),
    })

    const {
      address,
      cep,
      email,
      name,
      password,
      passwordConfirm,
      whatsappNumber,
    } = createORGRequestParams.parse(request.body)

    try {
      const orgAlreadyExists = await prismaClient.org.findFirst({
        where: {
          email,
        },
      })

      if (orgAlreadyExists) {
        return reply.status(400).send({
          error: 'Já existe uma ORG com este e-mail',
        })
      }

      if (password !== passwordConfirm) {
        return reply.status(400).send({
          error: 'As senhas não conferem',
        })
      }

      const hashedPassword = await bcryptjs.hash(password, 8)

      await prismaClient.org.create({
        data: {
          address,
          cep,
          email,
          name,
          whatsappNumber,
          password: hashedPassword,
        },
      })

      return reply.status(201).send()
    } catch (error) {
      return reply.status(400).send({
        error: 'Não foi possível cadastrar a ORG',
      })
    }
  })
}

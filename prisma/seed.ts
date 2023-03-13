import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const client = new PrismaClient()

async function run() {
  await client.pet.deleteMany()
  await client.org.deleteMany()

  /**
   * Criar orgs
   */

  const password = await bcryptjs.hash('123456', 8)

  await Promise.all([
    client.org.create({
      data: {
        id: '30ab4c94-593c-4a5b-8249-54364ef77612',
        cep: '01310‑900',
        address: 'Avenida Paulista, 52',
        email: 'adote_pets@email.com',
        nome: 'Adote Pets',
        password,
        whatsappNumber: '+558699999999',
      },
    }),
    client.org.create({
      data: {
        id: '24c7192d-1e26-4ced-bc65-2ae3a942d126',
        cep: '01310‑902',
        address: 'Avenida Paulista, 326',
        email: 'catinhos@email.com',
        nome: 'Catinhos',
        password,
        whatsappNumber: '+558699999998',
      },
    }),
  ])

  /**
   * Criar pets
   */

  await Promise.all([
    client.pet.create({
      data: {
        name: 'Caramelinho',
        age: 'cub',
        size: 'medium',
        city: 'São Paulo',
        description: 'Um doguinho para quem tem muito amor para dar',
        energy: 3,
        independence: 'high',
        type: 'dog',
        orgId: '30ab4c94-593c-4a5b-8249-54364ef77612',
        photo: 'caramelinho.jpeg',
      },
    }),
    client.pet.create({
      data: {
        name: 'Yoda',
        age: 'adolescent',
        size: 'small',
        city: 'São Paulo',
        description: 'Um companheiro para todas as horas',
        energy: 5,
        independence: 'low',
        type: 'cat',
        orgId: '30ab4c94-593c-4a5b-8249-54364ef77612',
        photo: 'yoda.jpeg',
      },
    }),
    client.pet.create({
      data: {
        name: 'Tigrão',
        age: 'elderly',
        size: 'big',
        city: 'São Paulo',
        description: 'Um bom amigo para quem gosta de um dog mais quietinho',
        energy: 2,
        independence: 'medium',
        type: 'dog',
        photo: 'tigrao.jpeg',
        orgId: '24c7192d-1e26-4ced-bc65-2ae3a942d126',
      },
    }),
  ])
}

run()
  .then(async () => {
    await client.$disconnect()
  })
  .catch(async (e) => {
    console.log(e)
    await client.$disconnect()
    process.exit(1)
  })

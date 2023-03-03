# Projeto

O FindAFriend tem o intuito conectar pessoas que desejam adotar pets com organizações que possuem pets para adoção.

## Definições do projeto

Aqui pontuamos tudo que iremos precisar para montar a aplicação final

### RF
- [x] Deve ser possível listar todos os pets disponíveis para adoção em uma cidade
- [x] Deve ser possível filtrar pets por suas características
- [ ] Deve ser possível visualizar detalhes de um pet para adoção
- [ ] Deve ser possível se cadastrar como uma ORG
- [ ] Deve ser possível realizar login como uma ORG
- [ ] Deve ser possível cadastrar um pet

### RNF
- [x] Utilizar Fastify para criar o esquema de rotas da api
- [ x Utilizar o prisma para lidar com banco de dados
- [ ] Multer para upload de arquivo (?)
- [ ] Usar a "BrasilAPI" para consultar a localização

### RN
- [ ] Para listar os pets, obrigatóriamente precisamos informar a cidade
- [ ] Uma ORG precisa ter um endereço e um número de WhatsApp
- [ ] Um pet deve estar ligado à uma ORG
- [ ] O usuário que quer adotar, entrará em contato com a ORG via WhatsApp
- [ ] Todos os filtros, além da cidade, são opcionais
- [ ] Para uma ORG acessar a aplicação Admin se estiver logado

## Sprints

Aqui vamos definir o que será desenvolvido em cada sprint

## Sprint 1

- [x] Iniciar o API do FindAFriend, configurando as libs que precisaremos para desenvolver e executar o projeto como Fastify, typescript, ESLint e etc.

- [x] Configurar entidades da aplicação e conectar com o prisma
- [x] Criar `seed` para podermos testar a aplicação
- [x] Criar listagem de pets por cidade
- [x] Aplicar filtros na listagem de pets 
- [ ] Criar rota que lista todas as cidades
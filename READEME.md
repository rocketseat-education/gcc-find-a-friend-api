# Projeto

O FindAFriend tem o intuito conectar pessoas que desejam adotar pets com organizações que possuem pets para adoção.

## Definições do projeto

Aqui pontuamos tudo que iremos precisar para montar a aplicação final

### RF
- [x] Deve ser possível listar todos os pets disponíveis para adoção em uma cidade
- [x] Deve ser possível filtrar pets por suas características
- [x] Deve ser possível visualizar detalhes de um pet para adoção
- [ ] Deve ser possível se cadastrar como uma ORG
- [ ] Deve ser possível realizar login como uma ORG
- [ ] Deve ser possível cadastrar um pet

### RNF
- [x] Utilizar Fastify para criar o esquema de rotas da api
- [x] Utilizar o prisma para lidar com banco de dados
- [ ] Multer para upload de arquivo (?)
- [x] Usar a "BrasilAPI" para consultar a localização

### RN
- [x] Para listar os pets, obrigatóriamente precisamos informar a cidade
- [x] Uma ORG precisa ter um endereço e um número de WhatsApp
- [x] Um pet deve estar ligado à uma ORG
- [ ] O usuário que quer adotar, entrará em contato com a ORG via WhatsApp
- [x] Todos os filtros, além da cidade, são opcionais
- [ ] Para uma ORG acessar a aplicação Admin se estiver logado

## Sprints

Aqui vamos definir o que será desenvolvido em cada sprint

## Sprint 1

- [x] Iniciar o API do FindAFriend, configurando as libs que precisaremos para desenvolver e executar o projeto como Fastify, typescript, ESLint e etc.

- [x] Configurar entidades da aplicação e conectar com o prisma
- [x] Criar `seed` para podermos testar a aplicação
- [x] Criar listagem de pets por cidade
- [x] Aplicar filtros na listagem de pets 
- [x] Criar rota que lista todas as cidades

## Sprint 2

- [x] Criar models que relacionam os pets com imagens e requisitos de adoção
- [x] Criar rota que exibe os detalhes do pet, fazendo relacionamento com a ORG
- [x] Criar rota que lista as imagens do pet pelo id
- [x] Criar rota que lista requisitos de adoção de um pet id


## Sprint 2

- [x] Criar estratégia de Login e rota para autenticação
- [ ] Criar rota para criação de uma ORG
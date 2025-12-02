# Cidad�o Ativo - Backend API

API desenvolvida com NestJS para a plataforma de participa��o cidad� "Cidad�o Ativo". Este backend gerencia usu�rios, projetos de lei, vota��es, den�ncias e propostas da comunidade.

## Credenciais de acesso para testes

CPF: 13271936986
Senha: 3d4f5y62d

## Tecnologias

- [NestJS](https://nestjs.com/) - Framework Node.js progressivo
- [TypeORM](https://typeorm.io/) - ORM para TypeScript e JavaScript
- [MySQL](https://www.mysql.com/) - Banco de dados relacional
- [Swagger](https://swagger.io/) - Documenta��o da API
- [JWT](https://jwt.io/) - Autentica��o JSON Web Token
- [Passport](http://www.passportjs.org/) - Middleware de autentica��o

## Funcionalidades

A API fornece endpoints para os seguintes m�dulos:

- **Auth**: Autentica��o de usu�rios e gest�o de tokens JWT.
- **Users**: Gest�o de usu�rios (cidad�os e administradores).
- **Projects**: Gest�o de projetos de lei e iniciativas municipais.
- **Votes**: Sistema de vota��o em projetos.
- **Reports**: Sistema de den�ncias e reportes de problemas na cidade.
- **Community Proposals**: Propostas criadas pela pr�pria comunidade.

## Pr�-requisitos

- [Node.js](https://nodejs.org/) (vers�o 18 ou superior)
- [MySQL](https://www.mysql.com/) Server

## Instala��o

1. Clone o reposit�rio:
   \\\ash
   git clone https://github.com/seu-usuario/cidadao-ativo.git
   cd cidadao-ativo/cidadao-ativo-backend
   \\\

2. Instale as depend�ncias:
   \\\ash
   npm install
   \\\

## Configura��o

1. Crie um arquivo \.env\ na raiz do diret�rio \cidadao-ativo-backend\ baseando-se nas vari�veis abaixo:

\\\env

# Configura��o do Servidor

PORT=3000
NODE_ENV=development

# Configura��o do Banco de Dados (Local)

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=sua_senha
DB_DATABASE=cidadao_ativo

# Configura��o JWT

JWT_SECRET=seu_segredo_super_secreto
JWT_EXPIRATION=1d

# Configura��o Banco de Dados (Produ��o/Heroku)

# JAWSDB_URL=mysql://usuario:senha@host:porta/banco

\\\

2. Configure o banco de dados MySQL:
   - Certifique-se que o servi�o do MySQL est� rodando.
   - Crie o banco de dados executando o script ou comando SQL:
     \\\sql
     CREATE DATABASE IF NOT EXISTS cidadao_ativo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     \\\
   - Para mais detalhes, consulte a pasta \database/\.

## Executando a Aplica��o

\\\ash

# desenvolvimento

npm run start

# modo watch (reinicia ao salvar arquivos)

npm run start:dev

# modo produ��o

npm run start:prod
\\\

A aplica��o estar� rodando em \http://localhost:3000\.

## Documenta��o da API

A documenta��o completa dos endpoints est� dispon�vel via Swagger UI.
Ap�s iniciar a aplica��o, acesse:

\\\
http://localhost:3000/api/docs
\\\

## Testes

\\\ash

# testes unit�rios

npm run test

# testes e2e

npm run test:e2e

# cobertura de testes

npm run test:cov
\\\

## Deploy

O projeto est� configurado para deploy no Heroku utilizando o banco de dados JawsDB MySQL.
Consulte os arquivos \Procfile\ e \deploy.ps1\ para mais informa��es sobre o processo de deploy.

## Licen�a

Este projeto est� sob a licen�a UNLICENSED.

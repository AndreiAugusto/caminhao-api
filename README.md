# Caminhão API

API REST do **Stradus**, sistema de gestão de frotas de caminhões: fretes, abastecimentos, manutenções, custos fixos, salários de motoristas e documentos da empresa.

O front-end fica no repositório [stradusV2](../stradusV2).

## Tecnologias

- [NestJS 11](https://nestjs.com/) + TypeScript
- PostgreSQL no [Neon](https://neon.tech/) (driver `@neondatabase/serverless`, SQL escrito à mão, sem ORM)
- Autenticação com JWT (`jsonwebtoken`) e senhas com `bcrypt`
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (privado) para arquivos de documentos e notas
- Swagger para documentação dos endpoints

## Como rodar

Pré-requisitos: Node.js 20+ e um banco PostgreSQL (Neon).

```bash
npm install
cp .env.example .env   # ou crie o .env manualmente (veja abaixo)
npm run start:dev
```

A API sobe em `http://localhost:5000` (ou na porta definida em `PORT`).
A documentação Swagger fica em **`http://localhost:5000/api`**.

### Variáveis de ambiente (`.env`)

| Variável                | Descrição                                                        |
| ----------------------- | ---------------------------------------------------------------- |
| `DATABASE_URL`          | String de conexão do PostgreSQL (Neon)                           |
| `TOKEN_SECRET`          | Segredo usado para assinar os JWT                                |
| `TOKEN_EXPIRES_IN`      | Validade do token (ex.: `8h`, `7d`)                              |
| `SALT`                  | Número de rounds do bcrypt (ex.: `10`)                           |
| `BLOB_STORE_ID`         | ID do store do Vercel Blob                                       |
| `BLOB_READ_WRITE_TOKEN` | Token de leitura/escrita do Vercel Blob                          |
| `PORT`                  | Porta HTTP (opcional, padrão `5000`)                             |

## Scripts

| Comando              | O que faz                              |
| -------------------- | -------------------------------------- |
| `npm run start:dev`  | Sobe em modo desenvolvimento (watch)   |
| `npm run build`      | Compila para `dist/`                   |
| `npm run start:prod` | Roda a versão compilada                |
| `npm run lint`       | ESLint                                 |
| `npm run format`     | Prettier                               |
| `npm test`           | Testes unitários (Jest)                |

## Banco de dados e migrations

As migrations ficam em [`migrations/`](migrations) e são **executadas manualmente**, em ordem, no editor SQL do Neon (ou via `psql`). Todas podem ser executadas mais de uma vez sem efeito colateral.

| Arquivo                                   | Conteúdo                                                        |
| ----------------------------------------- | --------------------------------------------------------------- |
| `001_nota.sql`                            | Notas (fotos/PDFs) anexadas a fretes e manutenções              |
| `002_empresa.sql`                         | Multiempresa: tabela `Empresa` e coluna `empresaId` nas tabelas |
| `003_adiantamento.sql`                    | Adiantamentos de salário dos motoristas                         |
| `004_adiantamento_parcelas_notas.sql`     | Parcelas de desconto dos adiantamentos e notas em adiantamentos |
| `005_empresa_demo.sql`                    | Empresa de demonstração e usuário do modo visitante             |

> As tabelas base (`usuario`, `Caminhao`, `Motorista`, `Frete`, etc.) já existiam antes das migrations e não estão versionadas aqui.

## Multiempresa

Cada usuário pertence a uma **empresa** e só enxerga e altera os dados dela.

- O `empresaId` vai no JWT e é lido nos controllers pelo decorator `@EmpresaId()` ([src/empresa/empresa.decorator.ts](src/empresa/empresa.decorator.ts)).
- Todas as consultas filtram por `"empresaId"`; ids enviados no corpo da requisição (caminhão, motorista, oficina, fazenda) são validados com `vinculosDaEmpresa()` ([src/empresa/vinculos.ts](src/empresa/vinculos.ts)).
- Todo cadastro novo (`POST /usuario/register`) cria a sua própria empresa.
- `Estado`, `Cidade` e `Carga` são tabelas de referência compartilhadas entre empresas.

## Autenticação

Todas as rotas exigem `Authorization: Bearer <token>`, exceto as marcadas com `@Public()`:

- `POST /usuario/login` — login com e-mail e senha
- `POST /usuario/register` — cadastro de usuário (cria uma empresa nova)
- `POST /usuario/visitante` — entrar como visitante

O guard global fica em [src/auth/jwt.guard.ts](src/auth/jwt.guard.ts).

### Modo visitante

`POST /usuario/visitante` devolve um token do usuário "Visitante", que pertence à **empresa de demonstração** (`"Empresa".demo = true`, criada pela migration `005`). Com ele é possível usar o sistema inteiro — cadastrar, editar e excluir — sem afetar dados reais.

- O usuário visitante não tem senha válida, então não entra pelo login normal.
- O token carrega `visitante: true`; com ele `PATCH /usuario/me` é bloqueado (403), para ninguém trocar o e-mail ou a senha do usuário compartilhado.
- Como todos os visitantes compartilham a mesma empresa, os dados de demonstração podem ser alterados por qualquer um. Para restaurá-los, apague os registros da empresa demo e execute a migration `005` de novo (os dados de exemplo só são inseridos quando a empresa não tem caminhões).

## Módulos / endpoints

| Recurso              | Rota base             | Observações                                                        |
| -------------------- | --------------------- | ------------------------------------------------------------------ |
| Usuário              | `/usuario`            | Login, cadastro, visitante, perfil (`/me`)                         |
| Caminhões            | `/caminhao`           | CRUD                                                               |
| Motoristas           | `/motorista`          | CRUD                                                               |
| Caminhão × Motorista | `/caminhao-motorista` | Associação de motoristas a caminhões                               |
| Oficinas             | `/oficina`            | CRUD                                                               |
| Fazendas             | `/fazenda`            | CRUD + contatos                                                    |
| Fretes               | `/frete`              | CRUD; comissão do motorista via `porcentagemMotorista`             |
| Abastecimentos       | `/abastecimento`      | CRUD                                                               |
| Manutenções          | `/manutencao`         | CRUD + parcelas de pagamento                                       |
| Custos fixos         | `/custo-fixo`         | CRUD + ajustes de valor por mês                                    |
| Adiantamentos        | `/adiantamento`       | Adiantamentos de salário, descontados em parcelas                  |
| Documentos           | `/documento`          | Upload direto ao Vercel Blob (`upload-token` → `confirmar`)        |
| Notas                | `/nota`               | Comprovantes de fretes, manutenções e adiantamentos                |
| Dashboard            | `/dashboard`          | Resumo do mês, salários, extrato, últimas movimentações, contagens |
| Estados/Cidades/Cargas | `/estado`, `/cidade`, `/carga` | Somente leitura                                      |

Detalhes de cada rota (parâmetros e corpo) estão no Swagger em `/api`.

## Estrutura

```
src/
  auth/          guard JWT global e decorator @Public()
  empresa/       decorator @EmpresaId() e validação de vínculos
  <recurso>/     controller, service e DTOs de cada módulo
  main.ts        bootstrap, CORS e Swagger
migrations/      scripts SQL (executados manualmente)
```

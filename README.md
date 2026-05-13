# API para gerenciamento de links de campanha

API REST construída com **Node.js**, **TypeScript**, **Express** e **Prisma** para gerenciar links de campanhas de forma dinâmica.

---
## Respostas
### 1. Como as entidades foram modeladas?
A modelagem foi feita utilizando o Prisma ORM com a seguinte estrutura de quatro camadas:

User: autenticação e isolamento de dados
Project: agrupamento de links relacionados
Link: armazena a `baseUrl` (URL de destino) e uma opcional `redirectUrl`
Parameter: representa pares de chave-valor reutilizáveis
- Relacionamentos:
User 1:N Project: Um usuário gerencia vários projetos.
Project 1:N Link: Um projeto organiza múltiplos links.
Link N:N Parameter: Através de uma tabela intermediária (`LinkParameter`), um link pode ter vários parâmetros e um mesmo parâmetro pode ser associado a múltiplos links.

### 2. Quais decisões foram tomadas e por quê?
Normalização de Parâmetros (N:N): decidi separá-los em uma tabela própria apra garantir integridade referencial e evitar dados multiplicados.
Hierarquia por Projetos: Tabela `Projects` permite que o sistema escale sem que o usuário se perca em uma lista única de milhares de links, facilitando a gestão por contexto.
Geração de URL no Runtime: A URL final não é salva no banco. Ela é construída dinamicamente pelo endpoint `/generate`. Isso permite que qualquer alteração na base ou nos parâmetros seja refletida instantaneamente sem necessidade de "reprocessar" os links.

### 3. Como a solução resolve o problema de escala na edição de links?
Minha solução resolve isso através do relacionamento N:N e da Edição Centralizada:
todos os links associados são atualizados automaticamente pois são editados em um unico lcoal
O usuário não precisa iterar sobre centenas de links para fazer uma alteração de UTM. Ele altera um único registro de parâmetro, e o endpoint de geração passa a entregar a nova URL para todos os links vinculados.
Evita erros humanos onde alguns links são atualizados e outros esquecidos, garantindo que toda a campanha siga o mesmo padrão de rastreamento.

## Funcionalidades

- **Autenticação de Usuário**: Registro e login com JWT  
- **Gerenciamento de Projetos**: Organize links em projetos  
- **Links Dinâmicos**: Crie links com uma URL base e destino opcional de redirecionamento  
- **Parâmetros Reutilizáveis**: Crie parâmetros chave-valor (ex.: UTMs) compartilháveis entre vários links  
- **Geração de Links**: Endpoint para gerar a URL final com todos os parâmetros anexados  

---

## Stack Tecnológica

- **Node.js** & **TypeScript**  
- **Express** (Framework Web)  
- **Prisma** (ORM)  
- **SQLite** (Banco de Dados Relacional)  
- **Zod** (Validação)  
- **JWT** (Autenticação)  

---

## Endpoints da API
### Autenticação
- POST /api/register → { email, password }
- POST /api/login → { email, password } → retorna { token }

### Projetos (Requer Token Bearer)
- POST /api/projects → { name }
- GET /api/projects → Lista projetos do usuário

### Parâmetros (Requer Token Bearer)
- POST /api/parameters → { key, value }
- GET /api/parameters → Lista parâmetros
- PUT /api/parameters/:id → Atualiza parâmetro

### Links (Requer Token Bearer)
- POST /api/links → { name, baseUrl, redirectUrl?, projectId, parameterIds[] }
- GET /api/projects/:projectId/links → Lista links de um projeto
- PUT /api/links/:id → Atualiza link
- DELETE /api/links/:id → Remove link

### Geração (Público)
GET /api/links/:id/generate → Retorna a URL final gerada






# ServeRest | QA com Cypress

[![Testes](https://github.com/RanyaG/serverest-cypress-qa/actions/workflows/ci.yml/badge.svg)](https://github.com/RanyaG/serverest-cypress-qa/actions/workflows/ci.yml)
![Cypress](https://img.shields.io/badge/Cypress-16-69D3A7?logo=cypress&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black)

Projeto de Qualidade de Software para o e-commerce **[ServeRest](https://serverest.dev)**: estratégia de teste, casos de teste documentados, testes automatizados de API e de interface com Cypress, bug reports e integração contínua.

> **English:** QA portfolio project for the ServeRest e-commerce: test plan, documented test cases (equivalence partitioning, boundary values, decision tables, state transitions), Cypress API + E2E automation with JSON Schema contract tests, real bug reports and a GitHub Actions pipeline.

## Em números

| | |
|---|---|
| **61** casos de teste documentados | **17** regras de negócio rastreadas |
| **55** testes de API (com contrato em JSON Schema) | **15** testes E2E + **2** apontando bugs abertos |
| **3** bugs reais encontrados e documentados | **5** técnicas de teste aplicadas |

## Estratégia

A maior parte das regras é validada na **API**, que é rápida e estável. A **interface** cobre os fluxos que o usuário percorre de ponta a ponta.

```
          ▲  E2E (15)       login, cadastro, admin de produtos, busca e lista de compras
         ▲▲▲ API (55)       usuários, login, produtos, carrinhos + contrato
        ▲▲▲▲▲ Documentação plano de teste, casos, BDD, matriz, bugs
```

- **Dados dinâmicos com Faker:** cada teste cria os próprios dados e apaga o que criou. Nenhum teste depende de outro.
- **API em ambiente isolado:** na CI, o ServeRest sobe em `localhost:3000` (`npx serverest`), sem depender do servidor público.
- **Preparação via API nos testes E2E:** usuários e produtos são criados pela API, e a interface fica só para o fluxo testado.
- **Testes de contrato:** as respostas são validadas contra JSON Schema com AJV.
- **Bugs viram testes:** o comportamento esperado de cada bug aberto já está automatizado com `it.skip`. Quando o bug for corrigido, é só reativar.

## Técnicas aplicadas

| Técnica | Exemplo no projeto |
|---|---|
| Partição de equivalência | Formatos de e-mail; valores aceitos em `administrador` |
| Análise de valor limite | Preço 0 / 1 / -1 / 1.5; quantidade -1 / 0 / 1; ID com 15 / 16 / 17 caracteres; estoque exato e acima |
| Tabela de decisão | Combinações de e-mail e senha no login |
| Transição de estados | Carrinho: sem carrinho → aberto → concluído ou cancelado, conferindo o estoque |
| Teste exploratório | Origem dos 3 bugs registrados |

## Bugs encontrados

| ID | Defeito | Severidade |
|---|---|---|
| [BUG-002](docs/bugs/BUG-002.md) | Depois de errar a senha, corrigir só a senha não faz login ("Email é obrigatório" com o e-mail preenchido) | Alta |
| [BUG-001](docs/bugs/BUG-001.md) | Diminuir um item com 1 unidade não o remove da lista de compras | Média |
| [BUG-003](docs/bugs/BUG-003.md) | Botão "Adicionar no carrinho" com `data-testid` duplicado | Baixa |

Cada bug tem passos para reproduzir, resultado esperado e obtido, evidência e a causa provável no código.

## Documentação

- [Plano de teste](docs/plano-de-teste.md): escopo, estratégia, critérios e riscos
- [Casos de teste](docs/casos-de-teste.md): os 61 casos com técnica, dados, resultado esperado e prioridade
- [Cenários BDD (Gherkin)](docs/bdd/)
- [Matriz de rastreabilidade](docs/matriz-de-rastreabilidade.md)
- [Bugs e melhorias sugeridas](docs/bugs/README.md)

## Estrutura

```
├── .github/workflows/ci.yml       # lint → testes de API e E2E em paralelo, com relatório
├── cypress/
│   ├── e2e/
│   │   ├── api/                   # usuarios, login, produtos, carrinhos
│   │   └── ui/                    # login, cadastro, admin de produtos, loja
│   └── support/
│       ├── commands/              # comandos de API, de UI e de contrato
│       ├── factories.js           # geração de dados com Faker
│       └── schemas.js             # contratos em JSON Schema
├── docs/                          # plano, casos, BDD, matriz e bugs
└── cypress.config.js
```

## Como rodar

Pré-requisito: Node.js 20 ou mais novo.

```bash
npm ci

npm run test:api:local   # sobe o ServeRest em localhost:3000 e roda os testes de API
npm run test:e2e         # testes de interface em front.serverest.dev (precisa do Chrome)
npm test                 # os dois
npm run cy:open          # modo interativo
npm run lint             # ESLint com as regras do plugin do Cypress
```

O relatório HTML fica em `cypress/reports/index.html`. Na CI, ele é publicado como artefato de cada execução.

## Integração contínua

O workflow roda a cada push e pull request, e todo dia às 9h, para monitorar o ambiente público:

1. **Lint:** ESLint com `eslint-plugin-cypress`
2. **API:** sobe o ServeRest localmente e roda os testes de API
3. **E2E:** roda os testes de interface no Chrome contra o front público

## Autora

**Ranya Greco**, QA Engineer · Engenheira de Software (UFC) e mestranda em Ciência da Computação (UFCG), com pesquisa em qualidade de suítes de testes automatizados.

[GitHub](https://github.com/RanyaG) · ranyagreco@gmail.com

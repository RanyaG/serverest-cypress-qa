# Plano de Teste: ServeRest

| | |
|---|---|
| Autora | Ranya Greco |
| Versão | 1.0 |
| Sistema sob teste | [ServeRest](https://serverest.dev) 3.5.0 (API) e [front.serverest.dev](https://front.serverest.dev) (loja) |

## 1. Objetivo

Verificar se as regras de negócio do e-commerce ServeRest funcionam como documentado e se os fluxos principais da loja funcionam para administradores e clientes. Os defeitos encontrados são registrados com evidência e passos para reproduzir.

## 2. Escopo

**Dentro do escopo**

| Módulo | API | Interface |
|---|---|---|
| Usuários | Cadastro, consulta, edição e exclusão | Cadastro pela tela |
| Login | Autenticação e token | Login, mensagens de erro e logout |
| Produtos | Cadastro, consulta, edição, exclusão e permissões | Cadastro e listagem pelo admin |
| Carrinhos | Cadastro, estoque, concluir e cancelar compra | Busca e Lista de Compras do cliente |

**Fora do escopo**

- Página de checkout: está marcada como "Em construção" no próprio sistema.
- Testes de carga e de segurança.
- Compatibilidade entre navegadores: a execução é só no Chrome.

## 3. Estratégia

Segue a pirâmide de testes: a maior parte das regras é validada na **API**, que é mais rápida e estável. A **interface** cobre os fluxos que o usuário de fato percorre.

| Nível | O que valida | Ambiente |
|---|---|---|
| API (funcional + contrato) | Regras de negócio, códigos de status, mensagens e o formato das respostas (JSON Schema) | ServeRest local, isolado (`npx serverest`) |
| E2E (interface) | Fluxos críticos de ponta a ponta | Ambiente público front.serverest.dev |
| Exploratório | Comportamentos fora do roteiro, que viraram os bugs registrados | Ambiente público e cópia local |

**Massa de dados:** cada teste cria os próprios dados com Faker e remove o que criou ao final. Nenhum teste depende de outro nem de dados pré-cadastrados.

**Preparação via API:** nos testes de interface, usuários e produtos são criados pela API. Isso deixa a interface só para o fluxo que está sendo validado.

## 4. Técnicas de teste

| Técnica | Onde foi aplicada |
|---|---|
| Partição de equivalência | Formato de e-mail; valores do campo `administrador` |
| Análise de valor limite | Preço (0, 1, -1, 1.5); quantidade (-1, 0, 1); tamanho do ID (15, 16, 17); estoque (igual e acima do disponível) |
| Tabela de decisão | Combinações de e-mail e senha no login |
| Transição de estados | Ciclo do carrinho: sem carrinho → aberto → concluído ou cancelado |
| Teste de contrato | JSON Schema das respostas de cadastro, login, usuário, produto e carrinho |
| Teste exploratório | Lista de Compras e login, onde foram achados os BUG-001, 002 e 003 |

## 5. Critérios

**Entrada**
- API e front no ar.
- Dependências instaladas (`npm ci`).

**Saída**
- 100% dos casos de prioridade alta executados.
- Nenhum teste falhando que não esteja ligado a um defeito registrado.
- Defeitos registrados com evidência.

## 6. Riscos

| Risco | Mitigação |
|---|---|
| Ambiente público instável ou com dados de outras pessoas | API testada localmente; dados únicos por execução; 1 nova tentativa só nos testes de interface |
| O front público está congelado e pode ser desativado no futuro | Os testes de API não dependem dele; os seletores usam `data-testid` |
| Token expira durante a execução | ServeRest local iniciado com `--timeout 3600` |

## 7. Entregáveis

- [Casos de teste](casos-de-teste.md) e [cenários BDD](bdd/)
- [Matriz de rastreabilidade](matriz-de-rastreabilidade.md)
- [Bug reports](bugs/README.md)
- Testes automatizados em `cypress/e2e` e relatório HTML gerado a cada execução na CI

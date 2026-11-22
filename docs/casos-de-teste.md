# Casos de Teste

Os 61 casos abaixo estão automatizados. O ID de cada caso aparece no nome do teste no Cypress e no relatório, então dá para ir do documento ao código e vice-versa. As regras de negócio (RN) estão na [matriz de rastreabilidade](matriz-de-rastreabilidade.md).

**Prioridade:** Alta = fluxo principal ou regra que bloqueia o negócio · Média = validação importante · Baixa = caso de borda.

---

## Modelo completo

Todo caso segue este modelo. Abaixo, dois casos escritos por inteiro. Nas tabelas seguintes, os passos ficam resumidos no cenário.

### CT-CAR-08: Cancelar compra remove o carrinho e devolve o estoque

| Campo | Conteúdo |
|---|---|
| Regra | RN-12 |
| Prioridade | Alta |
| Técnica | Transição de estados (aberto → cancelado) |
| Pré-condições | Usuário admin autenticado; produto com 10 unidades; usuário sem carrinho |
| Dados | Carrinho com 3 unidades do produto |

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | `POST /carrinhos` com 3 unidades | 201, carrinho criado |
| 2 | `GET /produtos/{id}` | Estoque = 7 |
| 3 | `DELETE /carrinhos/cancelar-compra` | 200, "Registro excluído com sucesso. Estoque dos produtos reabastecido" |
| 4 | `GET /produtos/{id}` | Estoque = 10 |

**Pós-condição:** usuário sem carrinho; estoque igual ao inicial.

### CT-UI-LOG-03: Mostra erro com senha incorreta

| Campo | Conteúdo |
|---|---|
| Regra | RN-14 |
| Prioridade | Alta |
| Técnica | Partição de equivalência (classe inválida: senha errada) |
| Pré-condições | Cliente cadastrado |
| Dados | E-mail do cliente; senha `senhaErrada123` |

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Abrir `/login` | Tela de login exibida |
| 2 | Informar e-mail e senha errada e clicar em **Entrar** | Alerta "Email e/ou senha inválidos" |
| 3 | Conferir a URL | Continua em `/login` |

---

## API: Usuários (`cypress/e2e/api/usuarios.cy.js`)

| ID | Cenário | Técnica | Dados | Resultado esperado | Prior. |
|---|---|---|---|---|---|
| CT-USR-01 | Cadastrar usuário válido | Classe válida + contrato | Usuário gerado com Faker | 201 e `_id`; `GET` devolve os mesmos dados | Alta |
| CT-USR-02 | Cadastrar com e-mail já usado | Classe inválida | E-mail de usuário existente | 400 "Este email já está sendo usado" | Alta |
| CT-USR-03 | Cadastrar sem nenhum campo | Classe inválida | `{}` | 400 com "é obrigatório" para os 4 campos | Média |
| CT-USR-04 | Cadastrar com nome e senha em branco | Classe inválida | `nome: ""`, `password: ""` | 400 "não pode ficar em branco" | Média |
| CT-USR-05 | Cadastrar com e-mail inválido (4 variações) | Partição de equivalência | `sem-arroba`, `ranya@`, `@qa.com`, `ranya qa@qa.com` | 400 "email deve ser um email válido" | Média |
| CT-USR-06 | Cadastrar com administrador inválido (4 variações) | Partição de equivalência | `"sim"`, `"TRUE"`, `true` (booleano), `""` | 400 "administrador deve ser 'true' ou 'false'" | Média |
| CT-USR-07 | Buscar usuário por e-mail | Classe válida + contrato | Filtro `?email=` | 200, `quantidade: 1` | Média |
| CT-USR-08 | Buscar ID inexistente | Classe inválida | `aaaaaaaaaaaaaaaa` | 400 "Usuário não encontrado" | Média |
| CT-USR-09 | Buscar ID com 15 e 17 caracteres | Valor limite (16) | `a` × 15, `a` × 17 | 400 "id deve ter exatamente 16 caracteres alfanuméricos" | Baixa |
| CT-USR-10 | Editar usuário | Classe válida | Novo nome, senha e perfil | 200; `GET` devolve os dados novos | Alta |
| CT-USR-11 | Editar ID inexistente | Regra documentada (upsert) | ID `zzzzzzzzzzzzzzzz` | 201, usuário criado | Baixa |
| CT-USR-12 | Excluir usuário sem carrinho | Classe válida | Usuário recém-criado | 200; `GET` passa a dar "Usuário não encontrado" | Alta |

## API: Login (`cypress/e2e/api/login.cy.js`)

| ID | Cenário | Técnica | Dados | Resultado esperado | Prior. |
|---|---|---|---|---|---|
| CT-LOG-01 | Login válido | Classe válida + contrato | E-mail e senha corretos | 200 e `authorization` começando com "Bearer " | Alta |
| CT-LOG-02 | Token dá acesso a rota protegida | Classe válida | Token do login | 200 em `DELETE /carrinhos/cancelar-compra` | Alta |
| CT-LOG-03 | E-mail certo, senha errada | Tabela de decisão | — | 401 "Email e/ou senha inválidos", sem token | Alta |
| CT-LOG-04 | E-mail não cadastrado | Tabela de decisão | — | 401 "Email e/ou senha inválidos" | Alta |
| CT-LOG-05 | E-mail com caixa alta diferente | Tabela de decisão | E-mail em maiúsculas | 401 (o e-mail diferencia maiúsculas) | Baixa |
| CT-LOG-06 | Sem e-mail e senha | Classe inválida | `{}` | 400 "é obrigatório" nos dois campos | Média |
| CT-LOG-07 | E-mail e senha em branco | Classe inválida | `""` | 400 "não pode ficar em branco" | Média |
| CT-LOG-08 | E-mail com formato inválido | Partição de equivalência | `email-invalido` | 400 "email deve ser um email válido" | Média |
| CT-LOG-09 | Rota protegida sem token | Classe inválida | Sem header | 401 "Token de acesso ausente, inválido..." | Alta |

**Tabela de decisão do login**

| Regra | E-mail cadastrado? | Senha correta? | Resultado | Caso |
|---|---|---|---|---|
| R1 | Sim | Sim | 200 + token | CT-LOG-01 |
| R2 | Sim | Não | 401 | CT-LOG-03 |
| R3 | Não | Qualquer | 401 | CT-LOG-04 |
| R4 | Sim, mas em outra caixa | Sim | 401 | CT-LOG-05 |

## API: Produtos (`cypress/e2e/api/produtos.cy.js`)

| ID | Cenário | Técnica | Dados | Resultado esperado | Prior. |
|---|---|---|---|---|---|
| CT-PRD-01 | Admin cadastra produto válido | Classe válida + contrato | Produto gerado com Faker | 201; `GET` devolve os mesmos dados | Alta |
| CT-PRD-02 | Nome repetido | Classe inválida | Nome de produto existente | 400 "Já existe produto com esse nome" | Alta |
| CT-PRD-03 | Sem nenhum campo | Classe inválida | `{}` | 400 com erro nos 4 campos | Média |
| CT-PRD-04 | Preço nos limites (4 casos) | Valor limite | 0, 1, -1, 1.5 | Só 1 é aceito; 0 e -1: "número positivo"; 1.5: "inteiro" | Alta |
| CT-PRD-05 | Quantidade nos limites (3 casos) | Valor limite | -1, 0, 1 | 0 e 1 aceitos; -1: "maior ou igual a 0" | Alta |
| CT-PRD-06 | Cadastrar sem token | Autorização | — | 401 | Alta |
| CT-PRD-07 | Cadastrar com token inválido | Autorização | `Bearer token.invalido` | 401 | Média |
| CT-PRD-08 | Cliente tenta cadastrar | Autorização | Token de não admin | 403 "Rota exclusiva para administradores" | Alta |
| CT-PRD-09 | Buscar pelo nome exato | Classe válida + contrato | `?nome=` | 200, `quantidade: 1` | Média |
| CT-PRD-10 | Editar produto | Classe válida | Novos dados | 200; `GET` devolve os dados novos | Alta |
| CT-PRD-11 | Excluir produto | Classe válida | — | 200; `GET` passa a dar "Produto não encontrado" | Alta |

## API: Carrinhos (`cypress/e2e/api/carrinhos.cy.js`)

Pré-condição comum: admin autenticado e produto com **10 unidades** a **R$ 150**.

| ID | Cenário | Técnica | Dados | Resultado esperado | Prior. |
|---|---|---|---|---|---|
| CT-CAR-01 | Cadastrar carrinho | Transição (sem → aberto) + contrato | 2 unidades | 201; total R$ 300; estoque 8 | Alta |
| CT-CAR-02 | Segundo carrinho | Classe inválida | — | 400 "Não é permitido ter mais de 1 carrinho" | Alta |
| CT-CAR-03 | Produto duplicado | Classe inválida | Mesmo produto 2× | 400 "Não é permitido possuir produto duplicado" | Média |
| CT-CAR-04 | Comprar o estoque exato | Valor limite | 10 unidades | 201; estoque 0 | Alta |
| CT-CAR-05 | Comprar acima do estoque | Valor limite | 11 unidades | 400 "Produto não possui quantidade suficiente" | Alta |
| CT-CAR-06 | Produto inexistente | Classe inválida | ID inexistente | 400 "Produto não encontrado" | Média |
| CT-CAR-07 | Concluir compra | Transição (aberto → concluído) | 3 unidades | 200; estoque continua 7 | Alta |
| CT-CAR-08 | Cancelar compra | Transição (aberto → cancelado) | 3 unidades | 200; estoque volta a 10 | Alta |
| CT-CAR-09 | Excluir produto que está em carrinho | Integridade | — | 400 "Não é permitido excluir produto que faz parte de carrinho" | Alta |
| CT-CAR-10 | Excluir usuário que tem carrinho | Integridade | — | 400 "Não é permitido excluir usuário com carrinho cadastrado" | Alta |
| CT-CAR-11 | Cadastrar carrinho sem token | Autorização | — | 401 | Média |

**Transição de estados do carrinho**

| Estado atual | Evento | Próximo estado | Efeito no estoque | Caso |
|---|---|---|---|---|
| Sem carrinho | Cadastrar | Aberto | Diminui | CT-CAR-01 |
| Aberto | Cadastrar outro | Aberto (recusado) | Nenhum | CT-CAR-02 |
| Aberto | Concluir compra | Sem carrinho | Continua baixado | CT-CAR-07 |
| Aberto | Cancelar compra | Sem carrinho | Volta ao valor inicial | CT-CAR-08 |

## Interface (`cypress/e2e/ui`)

Os cenários de interface também estão escritos em Gherkin na pasta [bdd](bdd/).

| ID | Cenário | Resultado esperado | Prior. |
|---|---|---|---|
| CT-UI-LOG-01 | Admin faz login | Vai para `/admin/home` com "Bem Vindo {nome}" | Alta |
| CT-UI-LOG-02 | Cliente faz login | Vai para `/home` com "Serverest Store" | Alta |
| CT-UI-LOG-03 | Senha incorreta | Alerta "Email e/ou senha inválidos" | Alta |
| CT-UI-LOG-04 | Campos vazios | Alertas "Email é obrigatório" e "Password é obrigatório" | Média |
| CT-UI-LOG-05 | Logout | Volta para `/login` e o token sai do localStorage | Média |
| CT-UI-LOG-06 | Corrigir só a senha após erro | Entra no sistema. **Falha hoje: [BUG-002](bugs/BUG-002.md)** | Alta |
| CT-UI-CAD-01 | Cliente se cadastra | Alerta de sucesso e vai para `/home` | Alta |
| CT-UI-CAD-02 | Admin se cadastra | Alerta de sucesso e vai para `/admin/home` | Alta |
| CT-UI-CAD-03 | E-mail já usado | Alerta "Este email já está sendo usado" | Média |
| CT-UI-PRD-01 | Admin navega até o cadastro de produtos | Abre `/admin/cadastrarprodutos` | Média |
| CT-UI-PRD-02 | Admin cadastra produto | Vai para a listagem; a linha mostra nome, preço e quantidade | Alta |
| CT-UI-PRD-03 | Produto com nome repetido | Alerta "Já existe produto com esse nome" | Média |
| CT-UI-LOJ-01 | Buscar produto pelo nome | Exatamente 1 card com o produto | Alta |
| CT-UI-LOJ-02 | Buscar produto inexistente | "Nenhum produto foi encontrado" | Média |
| CT-UI-LOJ-03 | Adicionar à lista | Produto na lista com "Total: 1" e o preço | Alta |
| CT-UI-LOJ-04 | Aumentar a quantidade | "Total: 2" e o preço dobra | Média |
| CT-UI-LOJ-05 | Limpar a lista | "Seu carrinho está vazio" | Média |
| CT-UI-LOJ-06 | Diminuir item com 1 unidade | Item sai da lista. **Falha hoje: [BUG-001](bugs/BUG-001.md)** | Média |

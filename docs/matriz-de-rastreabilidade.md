# Matriz de Rastreabilidade

Cada regra de negócio (RN) aponta para os casos que a cobrem e para o arquivo de teste automatizado.

| RN | Regra de negócio | Casos de teste | Automação | Cobertura |
|---|---|---|---|---|
| RN-01 | Cadastro de usuário exige nome, e-mail, senha e perfil | CT-USR-01, 03, 04 | `api/usuarios.cy.js` | ✅ |
| RN-02 | E-mail deve ser válido e único | CT-USR-02, 05 · CT-UI-CAD-03 | `api/usuarios.cy.js` · `ui/cadastro-usuario.cy.js` | ✅ |
| RN-03 | Perfil `administrador` aceita só `'true'` ou `'false'` | CT-USR-06 | `api/usuarios.cy.js` | ✅ |
| RN-04 | Usuário pode ser consultado, editado e excluído; ID tem 16 caracteres | CT-USR-07 a 12 | `api/usuarios.cy.js` | ✅ |
| RN-05 | Login válido devolve token Bearer; inválido é recusado | CT-LOG-01, 03 a 08 | `api/login.cy.js` | ✅ |
| RN-06 | Rotas protegidas exigem token válido | CT-LOG-02, 09 · CT-PRD-06, 07 · CT-CAR-11 | `api/login.cy.js` · `api/produtos.cy.js` · `api/carrinhos.cy.js` | ✅ |
| RN-07 | Só administrador cadastra, edita e exclui produto | CT-PRD-01, 08, 10, 11 | `api/produtos.cy.js` | ✅ |
| RN-08 | Nome de produto é único | CT-PRD-02 · CT-UI-PRD-03 | `api/produtos.cy.js` · `ui/admin-produtos.cy.js` | ✅ |
| RN-09 | Preço é inteiro positivo; quantidade é maior ou igual a 0 | CT-PRD-03, 04, 05 | `api/produtos.cy.js` | ✅ |
| RN-10 | Um carrinho por usuário, sem produto repetido | CT-CAR-02, 03, 06 | `api/carrinhos.cy.js` | ✅ |
| RN-11 | Carrinho respeita e baixa o estoque | CT-CAR-01, 04, 05 | `api/carrinhos.cy.js` | ✅ |
| RN-12 | Concluir mantém o estoque baixado; cancelar devolve | CT-CAR-07, 08 | `api/carrinhos.cy.js` | ✅ |
| RN-13 | Não exclui produto em carrinho nem usuário com carrinho | CT-CAR-09, 10 | `api/carrinhos.cy.js` | ✅ |
| RN-14 | Login na tela leva admin ao painel e cliente à loja, com mensagens de erro claras | CT-UI-LOG-01 a 06 | `ui/login.cy.js` | ⚠️ BUG-002 |
| RN-15 | Quem se cadastra pela tela já entra no sistema | CT-UI-CAD-01, 02 | `ui/cadastro-usuario.cy.js` | ✅ |
| RN-16 | Admin cadastra produto pela tela e o vê na listagem | CT-UI-PRD-01, 02 | `ui/admin-produtos.cy.js` | ✅ |
| RN-17 | Cliente busca produtos e gerencia a lista de compras | CT-UI-LOJ-01 a 06 | `ui/loja-lista-de-compras.cy.js` | ⚠️ BUG-001 |

✅ coberta e passando · ⚠️ coberta, com defeito aberto

# Defeitos encontrados

| ID | Título | Severidade | Prioridade | Módulo | Teste |
|---|---|---|---|---|---|
| [BUG-001](BUG-001.md) | Diminuir item com 1 unidade não remove o item da lista | Média | Média | Lista de Compras | CT-UI-LOJ-06 |
| [BUG-002](BUG-002.md) | Depois de errar a senha, corrigir só a senha não faz login | Alta | Alta | Login | CT-UI-LOG-06 |
| [BUG-003](BUG-003.md) | Botão "Adicionar no carrinho" tem dois `data-testid` | Baixa | Baixa | Lista de Compras | Inspeção |

Os testes dos defeitos abertos ficam com `it.skip`. Assim a CI continua verde, e o comportamento esperado já fica automatizado: quando o defeito for corrigido, basta remover o `.skip`.

## Melhorias sugeridas na API

Estes pontos seguem a documentação do ServeRest, então não são defeitos, mas fogem das convenções REST:

| Comportamento atual | Sugestão |
|---|---|
| `GET /usuarios/{id}` com ID inexistente responde **400** "Usuário não encontrado" | Responder **404** |
| `DELETE /usuarios/{id}` com ID inexistente responde **200** "Nenhum registro excluído" | Responder **404** |
| `PUT /usuarios/{id}` com ID inexistente **cria** um usuário (201) | Comportamento de *upsert* documentado; vale deixar explícito no contrato |
| `POST /produtos` aceita `preco` e `quantidade` como texto numérico (`"10"`) na versão 3.5.0, embora um comentário no código do front diga que a API recusa texto desde a 3.4.0 | Confirmar a regra com o time e alinhar API, front e documentação |

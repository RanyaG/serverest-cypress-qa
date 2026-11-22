# language: pt
Funcionalidade: Busca e lista de compras
  Como cliente da loja
  Quero buscar produtos e montar minha lista de compras
  Para escolher o que vou comprar

  Contexto:
    Dado que estou logado como cliente
    E existe o produto "Camiseta QA" a R$ 120

  Cenário: Buscar produto pelo nome (CT-UI-LOJ-01)
    Quando eu pesquiso por "Camiseta QA"
    Então devo ver 1 produto com o nome "Camiseta QA"

  Cenário: Busca sem resultado (CT-UI-LOJ-02)
    Quando eu pesquiso por um produto que não existe
    Então devo ver a mensagem "Nenhum produto foi encontrado"

  Cenário: Adicionar produto à lista (CT-UI-LOJ-03)
    Quando eu adiciono "Camiseta QA" à lista
    Então a lista deve mostrar "Camiseta QA" com "Total: 1" e preço de R$ 120

  Esquema do Cenário: Alterar a quantidade (CT-UI-LOJ-04 e CT-UI-LOJ-06)
    Dado que "Camiseta QA" está na minha lista com 1 unidade
    Quando eu clico no botão "<botão>"
    Então devo ver <resultado>

    Exemplos:
      | botão | resultado                                   |
      | +     | "Total: 2" e preço de R$ 240                |
      | -     | a mensagem "Seu carrinho está vazio" (BUG-001) |

  Cenário: Limpar a lista (CT-UI-LOJ-05)
    Dado que "Camiseta QA" está na minha lista
    Quando eu clico em "Limpar Lista"
    Então devo ver a mensagem "Seu carrinho está vazio"

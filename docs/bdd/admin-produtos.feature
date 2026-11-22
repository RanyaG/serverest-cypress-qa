# language: pt
Funcionalidade: Cadastro de produtos pelo administrador
  Como administrador da loja
  Quero cadastrar produtos pela tela
  Para que os clientes possam encontrá-los

  Contexto:
    Dado que estou logado como administrador

  Cenário: Acessar o cadastro pelo painel (CT-UI-PRD-01)
    Quando eu clico em "Cadastrar" no card de produtos
    Então devo ver a tela "Cadastro de Produtos"

  Cenário: Cadastrar produto (CT-UI-PRD-02)
    Quando eu cadastro um produto com nome, preço, descrição e quantidade válidos
    Então devo ir para a listagem de produtos
    E a listagem deve mostrar o produto com o preço e a quantidade informados

  Cenário: Nome repetido (CT-UI-PRD-03)
    Dado que já existe um produto chamado "Teclado Mecânico"
    Quando eu tento cadastrar outro produto chamado "Teclado Mecânico"
    Então devo ver a mensagem "Já existe produto com esse nome"

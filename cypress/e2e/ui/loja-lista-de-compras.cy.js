import { novoProduto } from '../../support/factories';

describe('UI | Loja: busca e lista de compras', { retries: { runMode: 1, openMode: 0 } }, () => {
  let admin;
  let cliente;
  let produto;

  const buscarProduto = (nome) => {
    cy.get('[data-testid="pesquisar"]').type(nome);
    cy.get('[data-testid="botaoPesquisar"]').click();
  };

  const adicionarNaLista = (nome) => {
    buscarProduto(nome);
    cy.contains('.card', nome).find('[data-testid="adicionarNaLista"]').click();
    cy.location('pathname').should('eq', '/minhaListaDeProdutos');
  };

  before(() => {
    cy.prepararUsuario().then((u) => {
      admin = u;
      cy.cadastrarProduto(admin.token, novoProduto({ preco: 120 })).then((p) => { produto = p; });
    });
    cy.prepararUsuario({ administrador: 'false' }).then((u) => { cliente = u; });
  });

  beforeEach(() => {
    cy.visitarAutenticado('/home', cliente);
  });

  after(() => {
    cy.excluirProduto(produto._id, admin.token);
    cy.excluirUsuario(admin._id);
    cy.excluirUsuario(cliente._id);
  });

  it('CT-UI-LOJ-01 | Encontra produto pelo nome', () => {
    buscarProduto(produto.nome);
    cy.get('.card').should('have.length', 1).and('contain', produto.nome);
  });

  it('CT-UI-LOJ-02 | Avisa quando a busca não encontra nada', () => {
    buscarProduto(`produto-que-nao-existe-${Date.now()}`);
    cy.contains('Nenhum produto foi encontrado').should('be.visible');
    cy.get('.card').should('not.exist');
  });

  it('CT-UI-LOJ-03 | Adiciona produto à lista de compras', () => {
    adicionarNaLista(produto.nome);
    cy.get('[data-testid="shopping-cart-product-name"]').should('contain', produto.nome);
    cy.get('[data-testid="shopping-cart-product-quantity"]').should('contain', 'Total: 1');
    cy.contains('p', 'Preço R$').should('contain', '120');
  });

  it('CT-UI-LOJ-04 | Aumenta a quantidade e o preço acompanha', () => {
    adicionarNaLista(produto.nome);
    cy.get('[data-testid="product-increase-quantity"]').click();
    cy.get('[data-testid="shopping-cart-product-quantity"]').should('contain', 'Total: 2');
    cy.contains('p', 'Preço R$').should('contain', '240');
  });

  it('CT-UI-LOJ-05 | Limpa a lista de compras', () => {
    adicionarNaLista(produto.nome);
    cy.get('[data-testid="limparLista"]').click();
    cy.get('[data-testid="shopping-cart-empty-message"]').should('have.text', 'Seu carrinho está vazio');
  });

  // Defeito conhecido: docs/bugs/BUG-001.md
  // Fica desativado até a correção para não quebrar a CI; reative removendo o ".skip".
  it.skip('CT-UI-LOJ-06 | [BUG-001] Diminuir a quantidade de um item com 1 unidade remove o item', () => {
    adicionarNaLista(produto.nome);
    cy.get('[data-testid="product-decrease-quantity"]').click();
    cy.get('[data-testid="shopping-cart-empty-message"]').should('be.visible');
  });
});

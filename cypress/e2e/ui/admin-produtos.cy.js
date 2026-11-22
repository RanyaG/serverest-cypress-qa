import { novoProduto } from '../../support/factories';

describe('UI | Admin: cadastro de produtos', { retries: { runMode: 1, openMode: 0 } }, () => {
  let admin;
  const nomes = [];

  const preencherProduto = ({ nome, preco, descricao, quantidade }) => {
    cy.get('[data-testid="nome"]').type(nome);
    cy.get('[data-testid="preco"]').type(String(preco));
    cy.get('[data-testid="descricao"]').type(descricao);
    cy.get('[data-testid="quantity"]').type(String(quantidade));
    cy.get('[data-testid="cadastarProdutos"]').click();
  };

  before(() => {
    cy.prepararUsuario().then((u) => { admin = u; });
  });

  after(() => {
    nomes.forEach((nome) => {
      cy.api('GET', '/produtos', { qs: { nome } }).then((res) => {
        res.body.produtos.forEach((p) => cy.excluirProduto(p._id, admin.token));
      });
    });
    cy.excluirUsuario(admin._id);
  });

  it('CT-UI-PRD-01 | Admin navega do painel até o cadastro de produtos', () => {
    cy.visitarAutenticado('/admin/home', admin);
    cy.get('[data-testid="cadastrarProdutos"]').click();
    cy.location('pathname').should('eq', '/admin/cadastrarprodutos');
    cy.contains('h1', 'Cadastro de Produtos').should('be.visible');
  });

  it('CT-UI-PRD-02 | Admin cadastra produto e ele aparece na listagem', () => {
    const produto = novoProduto();
    nomes.push(produto.nome);

    cy.visitarAutenticado('/admin/cadastrarprodutos', admin);
    preencherProduto(produto);

    cy.location('pathname').should('eq', '/admin/listarprodutos');
    cy.contains('table tbody tr', produto.nome, { timeout: 20000 })
      .should('contain', produto.preco)
      .and('contain', produto.quantidade);
  });

  it('CT-UI-PRD-03 | Mostra erro ao cadastrar produto com nome repetido', () => {
    cy.cadastrarProduto(admin.token, novoProduto()).then((existente) => {
      nomes.push(existente.nome);
      cy.visitarAutenticado('/admin/cadastrarprodutos', admin);
      preencherProduto(novoProduto({ nome: existente.nome }));
      cy.alerta().should('contain', 'Já existe produto com esse nome');
      cy.location('pathname').should('eq', '/admin/cadastrarprodutos');
    });
  });
});

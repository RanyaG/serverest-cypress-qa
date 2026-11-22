import { novoProduto } from '../../support/factories';
import { schemas } from '../../support/schemas';

/*
 * Transição de estados do carrinho:
 *   [sem carrinho] --cadastrar--> [aberto] --concluir-compra--> [sem carrinho] (estoque continua baixado)
 *                                  [aberto] --cancelar-compra--> [sem carrinho] (estoque volta)
 */
describe('API | Carrinhos', () => {
  let admin;
  let produto;

  const estoqueDe = (id) => cy.api('GET', `/produtos/${id}`).its('body.quantidade');
  const itens = (quantidade) => ({ produtos: [{ idProduto: produto._id, quantidade }] });

  beforeEach(() => {
    cy.prepararUsuario().then((u) => {
      admin = u;
      cy.cadastrarProduto(admin.token, novoProduto({ preco: 150, quantidade: 10 })).then((p) => { produto = p; });
    });
  });

  afterEach(() => {
    cy.cancelarCarrinho(admin.token);
    cy.excluirProduto(produto._id, admin.token);
    cy.excluirUsuario(admin._id);
  });

  it('CT-CAR-01 | Cadastra carrinho e baixa o estoque', () => {
    cy.api('POST', '/carrinhos', { body: itens(2), token: admin.token })
      .validarContrato(schemas.cadastro)
      .then((res) => {
        expect(res.status).to.eq(201);

        cy.api('GET', `/carrinhos/${res.body._id}`)
          .validarContrato(schemas.carrinho)
          .its('body')
          .should((carrinho) => {
            expect(carrinho.precoTotal, 'preço total = 2 x 150').to.eq(300);
            expect(carrinho.quantidadeTotal).to.eq(2);
            expect(carrinho.idUsuario).to.eq(admin._id);
          });
      });
    estoqueDe(produto._id).should('eq', 8);
  });

  it('CT-CAR-02 | Usuário não pode ter mais de um carrinho', () => {
    cy.api('POST', '/carrinhos', { body: itens(1), token: admin.token });
    cy.api('POST', '/carrinhos', { body: itens(1), token: admin.token }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Não é permitido ter mais de 1 carrinho');
    });
  });

  it('CT-CAR-03 | Não aceita o mesmo produto duas vezes no carrinho', () => {
    const duplicado = { produtos: [{ idProduto: produto._id, quantidade: 1 }, { idProduto: produto._id, quantidade: 1 }] };
    cy.api('POST', '/carrinhos', { body: duplicado, token: admin.token }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Não é permitido possuir produto duplicado');
    });
  });

  // Análise de valor limite sobre o estoque (10 unidades)
  it('CT-CAR-04 | Aceita comprar exatamente o estoque disponível', () => {
    cy.api('POST', '/carrinhos', { body: itens(10), token: admin.token }).its('status').should('eq', 201);
    estoqueDe(produto._id).should('eq', 0);
  });

  it('CT-CAR-05 | Recusa quantidade maior que o estoque', () => {
    cy.api('POST', '/carrinhos', { body: itens(11), token: admin.token }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Produto não possui quantidade suficiente');
      expect(res.body.item.quantidadeEstoque).to.eq(10);
    });
  });

  it('CT-CAR-06 | Recusa produto inexistente', () => {
    const inexistente = { produtos: [{ idProduto: 'aaaaaaaaaaaaaaaa', quantidade: 1 }] };
    cy.api('POST', '/carrinhos', { body: inexistente, token: admin.token }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Produto não encontrado');
    });
  });

  it('CT-CAR-07 | Concluir compra remove o carrinho e mantém o estoque baixado', () => {
    cy.api('POST', '/carrinhos', { body: itens(3), token: admin.token });
    cy.api('DELETE', '/carrinhos/concluir-compra', { token: admin.token }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.message).to.eq('Registro excluído com sucesso');
    });
    estoqueDe(produto._id).should('eq', 7);
  });

  it('CT-CAR-08 | Cancelar compra remove o carrinho e devolve o estoque', () => {
    cy.api('POST', '/carrinhos', { body: itens(3), token: admin.token });
    estoqueDe(produto._id).should('eq', 7);
    cy.api('DELETE', '/carrinhos/cancelar-compra', { token: admin.token }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.message).to.eq('Registro excluído com sucesso. Estoque dos produtos reabastecido');
    });
    estoqueDe(produto._id).should('eq', 10);
  });

  it('CT-CAR-09 | Não exclui produto que está em um carrinho', () => {
    cy.api('POST', '/carrinhos', { body: itens(1), token: admin.token });
    cy.api('DELETE', `/produtos/${produto._id}`, { token: admin.token }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Não é permitido excluir produto que faz parte de carrinho');
    });
  });

  it('CT-CAR-10 | Não exclui usuário que tem carrinho', () => {
    cy.api('POST', '/carrinhos', { body: itens(1), token: admin.token });
    cy.api('DELETE', `/usuarios/${admin._id}`).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Não é permitido excluir usuário com carrinho cadastrado');
    });
  });

  it('CT-CAR-11 | Recusa carrinho sem token', () => {
    cy.api('POST', '/carrinhos', { body: itens(1) }).its('status').should('eq', 401);
  });
});

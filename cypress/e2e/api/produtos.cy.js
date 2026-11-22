import { novoProduto } from '../../support/factories';
import { schemas } from '../../support/schemas';

describe('API | Produtos', () => {
  let admin;
  let cliente;
  const produtosCriados = [];
  const registrar = (id) => produtosCriados.push(id);

  before(() => {
    cy.prepararUsuario().then((u) => { admin = u; });
    cy.prepararUsuario({ administrador: 'false' }).then((u) => { cliente = u; });
  });

  after(() => {
    produtosCriados.forEach((id) => cy.excluirProduto(id, admin.token));
    cy.excluirUsuario(admin._id);
    cy.excluirUsuario(cliente._id);
  });

  context('Cadastro', () => {
    it('CT-PRD-01 | Admin cadastra produto com dados válidos', () => {
      const produto = novoProduto();
      cy.api('POST', '/produtos', { body: produto, token: admin.token })
        .validarContrato(schemas.cadastro)
        .then((res) => {
          expect(res.status).to.eq(201);
          registrar(res.body._id);
          cy.api('GET', `/produtos/${res.body._id}`)
            .validarContrato(schemas.produto)
            .its('body')
            .should('include', produto);
        });
    });

    it('CT-PRD-02 | Não cadastra produto com nome repetido', () => {
      cy.cadastrarProduto(admin.token, novoProduto()).then((existente) => {
        registrar(existente._id);
        cy.api('POST', '/produtos', { body: novoProduto({ nome: existente.nome }), token: admin.token }).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message).to.eq('Já existe produto com esse nome');
        });
      });
    });

    it('CT-PRD-03 | Exige todos os campos obrigatórios', () => {
      cy.api('POST', '/produtos', { body: {}, token: admin.token }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body).to.have.all.keys('nome', 'preco', 'descricao', 'quantidade');
      });
    });

    // Análise de valor limite: preço deve ser inteiro e maior que zero
    [
      { preco: 0, valido: false, mensagem: 'preco deve ser um número positivo' },
      { preco: 1, valido: true },
      { preco: -1, valido: false, mensagem: 'preco deve ser um número positivo' },
      { preco: 1.5, valido: false, mensagem: 'preco deve ser um inteiro' },
    ].forEach(({ preco, valido, mensagem }) => {
      it(`CT-PRD-04 | Preço = ${preco} → ${valido ? 'aceito' : 'recusado'}`, () => {
        cy.api('POST', '/produtos', { body: novoProduto({ preco }), token: admin.token }).then((res) => {
          if (valido) {
            expect(res.status).to.eq(201);
            registrar(res.body._id);
          } else {
            expect(res.status).to.eq(400);
            expect(res.body.preco).to.eq(mensagem);
          }
        });
      });
    });

    // Análise de valor limite: quantidade deve ser maior ou igual a zero
    [
      { quantidade: -1, valido: false },
      { quantidade: 0, valido: true },
      { quantidade: 1, valido: true },
    ].forEach(({ quantidade, valido }) => {
      it(`CT-PRD-05 | Quantidade = ${quantidade} → ${valido ? 'aceita' : 'recusada'}`, () => {
        cy.api('POST', '/produtos', { body: novoProduto({ quantidade }), token: admin.token }).then((res) => {
          if (valido) {
            expect(res.status).to.eq(201);
            registrar(res.body._id);
          } else {
            expect(res.status).to.eq(400);
            expect(res.body.quantidade).to.eq('quantidade deve ser maior ou igual a 0');
          }
        });
      });
    });
  });

  context('Autorização', () => {
    it('CT-PRD-06 | Recusa cadastro sem token', () => {
      cy.api('POST', '/produtos', { body: novoProduto() }).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.message).to.eq('Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
      });
    });

    it('CT-PRD-07 | Recusa cadastro com token inválido', () => {
      cy.api('POST', '/produtos', { body: novoProduto(), token: 'Bearer token.invalido' }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });

    it('CT-PRD-08 | Cliente (não admin) não pode cadastrar produto', () => {
      cy.api('POST', '/produtos', { body: novoProduto(), token: cliente.token }).then((res) => {
        expect(res.status).to.eq(403);
        expect(res.body.message).to.eq('Rota exclusiva para administradores');
      });
    });
  });

  context('Consulta, edição e exclusão', () => {
    it('CT-PRD-09 | Busca produto pelo nome exato', () => {
      cy.cadastrarProduto(admin.token, novoProduto()).then((produto) => {
        registrar(produto._id);
        cy.api('GET', '/produtos', { qs: { nome: produto.nome } })
          .validarContrato(schemas.listaProdutos)
          .then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body.quantidade).to.eq(1);
            expect(res.body.produtos[0]._id).to.eq(produto._id);
          });
      });
    });

    it('CT-PRD-10 | Admin edita um produto', () => {
      cy.cadastrarProduto(admin.token, novoProduto()).then((produto) => {
        registrar(produto._id);
        const alterado = novoProduto();
        cy.api('PUT', `/produtos/${produto._id}`, { body: alterado, token: admin.token }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.message).to.eq('Registro alterado com sucesso');
        });
        cy.api('GET', `/produtos/${produto._id}`).its('body').should('include', alterado);
      });
    });

    it('CT-PRD-11 | Admin exclui um produto', () => {
      cy.cadastrarProduto(admin.token, novoProduto()).then((produto) => {
        cy.api('DELETE', `/produtos/${produto._id}`, { token: admin.token }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.message).to.eq('Registro excluído com sucesso');
        });
        cy.api('GET', `/produtos/${produto._id}`).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message).to.eq('Produto não encontrado');
        });
      });
    });
  });
});

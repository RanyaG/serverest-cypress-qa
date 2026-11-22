import { novoUsuario } from '../factories';

const apiUrl = () => Cypress.expose('apiUrl');

/**
 * Requisição genérica à API do ServeRest.
 * failOnStatusCode: false para que os cenários negativos validem o status retornado.
 */
Cypress.Commands.add('api', (method, path, { body, token, qs } = {}) => cy.request({
  method,
  url: `${apiUrl()}${path}`,
  body,
  qs,
  headers: token ? { authorization: token } : {},
  failOnStatusCode: false,
}));

Cypress.Commands.add('cadastrarUsuario', (usuario) => cy.api('POST', '/usuarios', { body: usuario })
  .then((res) => {
    expect(res.status, 'pré-condição: usuário cadastrado').to.eq(201);
    return cy.wrap({ ...usuario, _id: res.body._id }, { log: false });
  }));

Cypress.Commands.add('obterToken', (email, password) => cy.api('POST', '/login', { body: { email, password } })
  .then((res) => {
    expect(res.status, 'pré-condição: login realizado').to.eq(200);
    return cy.wrap(res.body.authorization, { log: false });
  }));

/** Cadastra um usuário (admin por padrão) e já devolve o token dele. */
Cypress.Commands.add('prepararUsuario', (sobrescrever = {}) => cy.cadastrarUsuario(novoUsuario(sobrescrever))
  .then((usuario) => cy.obterToken(usuario.email, usuario.password)
    .then((token) => cy.wrap({ ...usuario, token }, { log: false }))));

Cypress.Commands.add('cadastrarProduto', (token, produto) => cy.api('POST', '/produtos', { body: produto, token })
  .then((res) => {
    expect(res.status, 'pré-condição: produto cadastrado').to.eq(201);
    return cy.wrap({ ...produto, _id: res.body._id }, { log: false });
  }));

// Limpeza: os testes apagam o que criaram, deixando o ambiente como encontraram.
Cypress.Commands.add('cancelarCarrinho', (token) => cy.api('DELETE', '/carrinhos/cancelar-compra', { token }));
Cypress.Commands.add('excluirProduto', (id, token) => cy.api('DELETE', `/produtos/${id}`, { token }));
Cypress.Commands.add('excluirUsuario', (id) => cy.api('DELETE', `/usuarios/${id}`));

import { schemas } from '../../support/schemas';

describe('API | Login', () => {
  let usuario;

  before(() => {
    cy.prepararUsuario().then((u) => { usuario = u; });
  });

  after(() => {
    cy.excluirUsuario(usuario._id);
  });

  it('CT-LOG-01 | Faz login com credenciais válidas e recebe token Bearer', () => {
    cy.api('POST', '/login', { body: { email: usuario.email, password: usuario.password } })
      .validarContrato(schemas.login)
      .its('status')
      .should('eq', 200);
  });

  it('CT-LOG-02 | Token recebido dá acesso a rota protegida', () => {
    cy.obterToken(usuario.email, usuario.password).then((token) => {
      cy.api('DELETE', '/carrinhos/cancelar-compra', { token }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.message).to.eq('Não foi encontrado carrinho para esse usuário');
      });
    });
  });

  it('CT-LOG-09 | Rota protegida recusa requisição sem token', () => {
    cy.api('DELETE', '/carrinhos/cancelar-compra').then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body.message).to.eq('Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
    });
  });

  // Tabela de decisão: combinações de e-mail e senha
  const tabelaDeDecisao = [
    { id: 'CT-LOG-03', regra: 'e-mail certo e senha errada', email: () => usuario.email, senha: () => 'senhaErrada123' },
    { id: 'CT-LOG-04', regra: 'e-mail não cadastrado e senha qualquer', email: () => 'naoexiste.qa@qa.com.br', senha: () => usuario.password },
    { id: 'CT-LOG-05', regra: 'e-mail com caixa alta diferente', email: () => usuario.email.toUpperCase(), senha: () => usuario.password },
  ];

  tabelaDeDecisao.forEach(({ id, regra, email, senha }) => {
    it(`${id} | Recusa login com ${regra}`, () => {
      cy.api('POST', '/login', { body: { email: email(), password: senha() } }).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.message).to.eq('Email e/ou senha inválidos');
        expect(res.body).to.not.have.property('authorization');
      });
    });
  });

  it('CT-LOG-06 | Exige e-mail e senha', () => {
    cy.api('POST', '/login', { body: {} }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body).to.deep.eq({ email: 'email é obrigatório', password: 'password é obrigatório' });
    });
  });

  it('CT-LOG-07 | Não aceita e-mail e senha em branco', () => {
    cy.api('POST', '/login', { body: { email: '', password: '' } }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body).to.deep.eq({
        email: 'email não pode ficar em branco',
        password: 'password não pode ficar em branco',
      });
    });
  });

  it('CT-LOG-08 | Valida o formato do e-mail', () => {
    cy.api('POST', '/login', { body: { email: 'email-invalido', password: '123' } }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.email).to.eq('email deve ser um email válido');
    });
  });
});

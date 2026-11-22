import { novoUsuario, novoCliente } from '../../support/factories';

describe('UI | Cadastro de usuário', { retries: { runMode: 1, openMode: 0 } }, () => {
  const emails = [];

  const preencherCadastro = ({ nome, email, password, administrador }) => {
    cy.visit('/cadastrarusuarios');
    cy.get('[data-testid="nome"]').type(nome);
    cy.get('[data-testid="email"]').type(email);
    cy.get('[data-testid="password"]').type(password, { log: false });
    if (administrador === 'true') cy.get('[data-testid="checkbox"]').check();
    cy.get('[data-testid="cadastrar"]').click();
  };

  after(() => {
    emails.forEach((email) => {
      cy.api('GET', '/usuarios', { qs: { email } }).then((res) => {
        res.body.usuarios.forEach((u) => cy.excluirUsuario(u._id));
      });
    });
  });

  it('CT-UI-CAD-01 | Cliente se cadastra e entra na loja', () => {
    const cliente = novoCliente();
    emails.push(cliente.email);

    preencherCadastro(cliente);
    cy.contains('.alert', 'Cadastro realizado com sucesso').should('be.visible');
    cy.location('pathname', { timeout: 10000 }).should('eq', '/home');
  });

  it('CT-UI-CAD-02 | Administrador se cadastra e entra no painel', () => {
    const admin = novoUsuario();
    emails.push(admin.email);

    preencherCadastro(admin);
    cy.contains('.alert', 'Cadastro realizado com sucesso').should('be.visible');
    cy.location('pathname', { timeout: 10000 }).should('eq', '/admin/home');
  });

  it('CT-UI-CAD-03 | Não permite cadastrar e-mail já usado', () => {
    cy.cadastrarUsuario(novoCliente()).then((existente) => {
      emails.push(existente.email);
      preencherCadastro(novoCliente({ email: existente.email }));
      cy.alerta().should('contain', 'Este email já está sendo usado');
      cy.location('pathname').should('eq', '/cadastrarusuarios');
    });
  });
});

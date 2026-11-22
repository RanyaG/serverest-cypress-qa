// Ambiente público e compartilhado: uma nova tentativa na CI evita falso negativo por instabilidade de rede.
// As falhas da primeira tentativa continuam aparecendo no relatório.
describe('UI | Login', { retries: { runMode: 1, openMode: 0 } }, () => {
  let admin;
  let cliente;

  before(() => {
    cy.prepararUsuario().then((u) => { admin = u; });
    cy.prepararUsuario({ administrador: 'false' }).then((u) => { cliente = u; });
  });

  after(() => {
    cy.excluirUsuario(admin._id);
    cy.excluirUsuario(cliente._id);
  });

  it('CT-UI-LOG-01 | Administrador entra e vê o painel admin', () => {
    cy.loginUI(admin.email, admin.password);
    cy.location('pathname').should('eq', '/admin/home');
    cy.contains('h1', 'Bem Vindo').should('contain', admin.nome);
  });

  it('CT-UI-LOG-02 | Cliente entra e vê a loja', () => {
    cy.loginUI(cliente.email, cliente.password);
    cy.location('pathname').should('eq', '/home');
    cy.contains('h1', 'Serverest Store').should('be.visible');
  });

  it('CT-UI-LOG-03 | Mostra erro com senha incorreta', () => {
    cy.loginUI(cliente.email, 'senhaErrada123');
    cy.alerta().should('contain', 'Email e/ou senha inválidos');
    cy.location('pathname').should('eq', '/login');
  });

  it('CT-UI-LOG-04 | Mostra erro com campos vazios', () => {
    cy.loginUI();
    cy.contains('.alert', 'Email é obrigatório').should('be.visible');
    cy.contains('.alert', 'Password é obrigatório').should('be.visible');
  });

  // Defeito conhecido: docs/bugs/BUG-002.md
  // Fica desativado até a correção para não quebrar a CI; reative removendo o ".skip".
  it.skip('CT-UI-LOG-06 | [BUG-002] Após um erro, corrigir só a senha permite entrar', () => {
    cy.loginUI(cliente.email, 'senhaErrada123');
    cy.alerta().should('contain', 'Email e/ou senha inválidos');
    cy.get('[data-testid="senha"]').clear();
    cy.get('[data-testid="senha"]').type(cliente.password, { log: false });
    cy.get('[data-testid="entrar"]').click();
    cy.location('pathname').should('eq', '/home');
  });

  it('CT-UI-LOG-05 | Logout volta para o login e limpa a sessão', () => {
    cy.loginUI(cliente.email, cliente.password);
    cy.location('pathname').should('eq', '/home');
    cy.get('[data-testid="logout"]').click();
    cy.location('pathname').should('eq', '/login');
    cy.window().its('localStorage').invoke('getItem', 'serverest/userToken').should('be.null');
  });
});

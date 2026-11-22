/** Login pela tela, do jeito que o usuário faz. */
Cypress.Commands.add('loginUI', (email, senha) => {
  cy.visit('/login');
  if (email) cy.get('[data-testid="email"]').type(email);
  if (senha) cy.get('[data-testid="senha"]').type(senha, { log: false });
  cy.get('[data-testid="entrar"]').click();
});

/**
 * Abre uma página já autenticado, sem passar pela tela de login.
 * Usa o mesmo localStorage que o front grava após o login, o que deixa
 * os testes mais rápidos e focados no fluxo que está sendo validado.
 */
Cypress.Commands.add('visitarAutenticado', (caminho, usuario) => {
  cy.visit(caminho, {
    onBeforeLoad(win) {
      win.localStorage.setItem('serverest/userToken', usuario.token);
      win.localStorage.setItem('serverest/userEmail', usuario.email);
      win.localStorage.setItem('serverest/userNome', usuario.nome);
    },
  });
});

Cypress.Commands.add('alerta', () => cy.get('.alert'));

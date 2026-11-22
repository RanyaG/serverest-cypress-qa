import { novoUsuario } from '../../support/factories';
import { schemas } from '../../support/schemas';

describe('API | Usuários', () => {
  const criados = [];
  const registrar = (usuario) => { criados.push(usuario._id); return usuario; };

  after(() => {
    criados.forEach((id) => cy.excluirUsuario(id));
  });

  context('Cadastro', () => {
    it('CT-USR-01 | Cadastra usuário com dados válidos', () => {
      const usuario = novoUsuario();

      cy.api('POST', '/usuarios', { body: usuario })
        .validarContrato(schemas.cadastro)
        .then((res) => {
          expect(res.status).to.eq(201);
          registrar({ _id: res.body._id });

          cy.api('GET', `/usuarios/${res.body._id}`)
            .validarContrato(schemas.usuario)
            .its('body')
            .should('include', usuario);
        });
    });

    it('CT-USR-02 | Não cadastra usuário com e-mail já usado', () => {
      cy.cadastrarUsuario(novoUsuario()).then((existente) => {
        registrar(existente);
        cy.api('POST', '/usuarios', { body: novoUsuario({ email: existente.email }) }).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message).to.eq('Este email já está sendo usado');
        });
      });
    });

    it('CT-USR-03 | Exige todos os campos obrigatórios', () => {
      cy.api('POST', '/usuarios', { body: {} }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body).to.deep.eq({
          nome: 'nome é obrigatório',
          email: 'email é obrigatório',
          password: 'password é obrigatório',
          administrador: 'administrador é obrigatório',
        });
      });
    });

    it('CT-USR-04 | Não aceita campos em branco', () => {
      cy.api('POST', '/usuarios', { body: novoUsuario({ nome: '', password: '' }) }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.nome).to.eq('nome não pode ficar em branco');
        expect(res.body.password).to.eq('password não pode ficar em branco');
      });
    });

    // Partição de equivalência: e-mail com formato inválido
    ['sem-arroba', 'ranya@', '@qa.com', 'ranya qa@qa.com'].forEach((email) => {
      it(`CT-USR-05 | Rejeita e-mail inválido: "${email}"`, () => {
        cy.api('POST', '/usuarios', { body: novoUsuario({ email }) }).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.email).to.eq('email deve ser um email válido');
        });
      });
    });

    // Partição de equivalência: "administrador" só aceita as strings 'true' e 'false'
    ['sim', 'TRUE', true, ''].forEach((administrador) => {
      it(`CT-USR-06 | Rejeita administrador = ${JSON.stringify(administrador)}`, () => {
        cy.api('POST', '/usuarios', { body: novoUsuario({ administrador }) }).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.administrador).to.eq("administrador deve ser 'true' ou 'false'");
        });
      });
    });
  });

  context('Consulta', () => {
    it('CT-USR-07 | Busca usuário pelo filtro de e-mail', () => {
      cy.cadastrarUsuario(novoUsuario()).then((usuario) => {
        registrar(usuario);
        cy.api('GET', '/usuarios', { qs: { email: usuario.email } })
          .validarContrato(schemas.listaUsuarios)
          .then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body.quantidade).to.eq(1);
            expect(res.body.usuarios[0]._id).to.eq(usuario._id);
          });
      });
    });

    it('CT-USR-08 | Retorna erro para ID inexistente', () => {
      cy.api('GET', '/usuarios/aaaaaaaaaaaaaaaa').then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Usuário não encontrado');
      });
    });

    // Análise de valor limite: o ID precisa ter exatamente 16 caracteres
    [15, 17].forEach((tamanho) => {
      it(`CT-USR-09 | Rejeita ID com ${tamanho} caracteres (limite = 16)`, () => {
        cy.api('GET', `/usuarios/${'a'.repeat(tamanho)}`).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.id).to.eq('id deve ter exatamente 16 caracteres alfanuméricos');
        });
      });
    });
  });

  context('Edição e exclusão', () => {
    it('CT-USR-10 | Edita os dados de um usuário', () => {
      cy.cadastrarUsuario(novoUsuario()).then((usuario) => {
        registrar(usuario);
        const alterado = { ...novoUsuario({ email: usuario.email }), administrador: 'false' };

        cy.api('PUT', `/usuarios/${usuario._id}`, { body: alterado }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.message).to.eq('Registro alterado com sucesso');
        });
        cy.api('GET', `/usuarios/${usuario._id}`).its('body').should('include', alterado);
      });
    });

    it('CT-USR-11 | PUT com ID inexistente cria um novo usuário', () => {
      const usuario = novoUsuario();
      cy.api('PUT', '/usuarios/zzzzzzzzzzzzzzzz', { body: usuario }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.message).to.eq('Cadastro realizado com sucesso');
        registrar({ _id: res.body._id });
      });
    });

    it('CT-USR-12 | Exclui usuário sem carrinho', () => {
      cy.cadastrarUsuario(novoUsuario()).then((usuario) => {
        cy.api('DELETE', `/usuarios/${usuario._id}`).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.message).to.eq('Registro excluído com sucesso');
        });
        cy.api('GET', `/usuarios/${usuario._id}`).its('body.message').should('eq', 'Usuário não encontrado');
      });
    });
  });
});

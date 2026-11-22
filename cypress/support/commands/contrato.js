import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });
const validadores = new Map();

/**
 * Teste de contrato: valida o corpo da resposta contra um JSON Schema.
 * Uso: cy.api('GET', '/usuarios').validarContrato(schemas.listaUsuarios)
 */
Cypress.Commands.add('validarContrato', { prevSubject: true }, (resposta, schema) => {
  if (!validadores.has(schema)) validadores.set(schema, ajv.compile(schema));
  const validar = validadores.get(schema);
  const valido = validar(resposta.body);
  expect(valido, `contrato respeitado ${valido ? '' : ajv.errorsText(validar.errors)}`).to.be.true;
  return resposta;
});

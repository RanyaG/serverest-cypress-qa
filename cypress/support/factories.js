import { fakerPT_BR as faker } from '@faker-js/faker';

// Dados dinâmicos: cada execução cria registros únicos, então os testes
// não dependem de massa pré-cadastrada nem uns dos outros.

const sufixo = () => faker.string.alphanumeric(8).toLowerCase();

export const novoUsuario = (sobrescrever = {}) => ({
  nome: faker.person.fullName(),
  email: `qa.${sufixo()}.${Date.now()}@qa.com.br`,
  password: faker.internet.password({ length: 10 }),
  administrador: 'true',
  ...sobrescrever,
});

export const novoCliente = (sobrescrever = {}) => novoUsuario({ administrador: 'false', ...sobrescrever });

export const novoProduto = (sobrescrever = {}) => ({
  nome: `${faker.commerce.productName()} ${sufixo()}`,
  preco: faker.number.int({ min: 10, max: 5000 }),
  descricao: faker.commerce.productDescription().slice(0, 120),
  quantidade: faker.number.int({ min: 10, max: 100 }),
  ...sobrescrever,
});

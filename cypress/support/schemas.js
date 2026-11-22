// Contratos (JSON Schema) das respostas da API, conforme a documentação do ServeRest.

const id = { type: 'string', pattern: '^[A-Za-z0-9]{16}$' };

const usuario = {
  type: 'object',
  required: ['nome', 'email', 'password', 'administrador', '_id'],
  properties: {
    nome: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    administrador: { type: 'string', enum: ['true', 'false'] },
    _id: id,
  },
};

const produto = {
  type: 'object',
  required: ['nome', 'preco', 'descricao', 'quantidade', '_id'],
  properties: {
    nome: { type: 'string' },
    preco: { type: 'integer', minimum: 1 },
    descricao: { type: 'string' },
    quantidade: { type: 'integer', minimum: 0 },
    _id: id,
  },
};

export const schemas = {
  cadastro: {
    type: 'object',
    required: ['message', '_id'],
    properties: { message: { const: 'Cadastro realizado com sucesso' }, _id: id },
  },
  login: {
    type: 'object',
    required: ['message', 'authorization'],
    properties: {
      message: { const: 'Login realizado com sucesso' },
      authorization: { type: 'string', pattern: '^Bearer .+' },
    },
  },
  usuario,
  produto,
  listaUsuarios: {
    type: 'object',
    required: ['quantidade', 'usuarios'],
    properties: { quantidade: { type: 'integer' }, usuarios: { type: 'array', items: usuario } },
  },
  listaProdutos: {
    type: 'object',
    required: ['quantidade', 'produtos'],
    properties: { quantidade: { type: 'integer' }, produtos: { type: 'array', items: produto } },
  },
  carrinho: {
    type: 'object',
    required: ['produtos', 'precoTotal', 'quantidadeTotal', 'idUsuario', '_id'],
    properties: {
      produtos: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['idProduto', 'quantidade', 'precoUnitario'],
          properties: {
            idProduto: id,
            quantidade: { type: 'integer', minimum: 1 },
            precoUnitario: { type: 'integer' },
          },
        },
      },
      precoTotal: { type: 'integer' },
      quantidadeTotal: { type: 'integer' },
      idUsuario: id,
      _id: id,
    },
  },
};

# language: pt
Funcionalidade: Login na loja ServeRest
  Como usuário cadastrado
  Quero entrar com meu e-mail e senha
  Para acessar a loja ou o painel de administração

  Contexto:
    Dado que estou na tela de login

  Cenário: Administrador entra no painel (CT-UI-LOG-01)
    Quando eu entro com as credenciais de um administrador
    Então devo ver o painel admin com "Bem Vindo" e o meu nome

  Cenário: Cliente entra na loja (CT-UI-LOG-02)
    Quando eu entro com as credenciais de um cliente
    Então devo ver a página "Serverest Store"

  Cenário: Senha incorreta (CT-UI-LOG-03)
    Quando eu entro com um e-mail cadastrado e a senha "senhaErrada123"
    Então devo ver a mensagem "Email e/ou senha inválidos"
    E devo continuar na tela de login

  Cenário: Campos vazios (CT-UI-LOG-04)
    Quando eu clico em "Entrar" sem preencher nada
    Então devo ver as mensagens "Email é obrigatório" e "Password é obrigatório"

  @bug @BUG-002
  Cenário: Corrigir só a senha depois de um erro (CT-UI-LOG-06)
    Dado que eu errei a senha e vi a mensagem "Email e/ou senha inválidos"
    Quando eu corrijo apenas a senha e clico em "Entrar"
    Então devo entrar na loja

  Cenário: Logout (CT-UI-LOG-05)
    Dado que estou logado como cliente
    Quando eu clico em "Logout"
    Então devo voltar para a tela de login
    E minha sessão deve ser apagada do navegador

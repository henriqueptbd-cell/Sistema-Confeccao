# Product Backlog — Sistema de Confecção de Roupas Personalizadas

> Documento gerado com base no levantamento de requisitos e visão do produto.
> Controle de produção definido: **por pedido**.
> Metodologia: **Scrum**

---

## Épicos

| ID | Épico |
|----|-------|
| EP01 | Gestão de Clientes |
| EP02 | Gestão de Pedidos |
| EP03 | Controle de Produção |
| EP04 | Consulta Pública de Pedidos |
| EP05 | Painel do Administrador |
| EP06 | Painel da Funcionária de Produção |

---

## EP01 — Gestão de Clientes

### US01 — Cadastrar cliente

**Como** administrador,
**quero** cadastrar um novo cliente no sistema,
**para que** eu possa vinculá-lo a um pedido.

**Critérios de aceitação:**
- [ ] O formulário deve conter: nome, telefone e observações opcionais
- [ ] O telefone deve ser único no sistema (sem duplicatas)
- [ ] O sistema deve confirmar o cadastro com uma mensagem de sucesso
- [ ] O cliente cadastrado deve aparecer na listagem de clientes

---

### US02 — Buscar cliente existente

**Como** administrador,
**quero** buscar um cliente já cadastrado pelo nome ou telefone,
**para que** eu não precise recadastrar clientes recorrentes.

**Critérios de aceitação:**
- [ ] A busca deve funcionar por nome parcial ou telefone
- [ ] Os resultados devem aparecer em tempo real durante a digitação
- [ ] Ao selecionar um cliente, seus dados devem ser preenchidos automaticamente no formulário de pedido

---

### US03 — Editar dados do cliente

**Como** administrador,
**quero** editar os dados de um cliente cadastrado,
**para que** eu mantenha as informações sempre atualizadas.

**Critérios de aceitação:**
- [ ] Todos os campos do cadastro devem ser editáveis
- [ ] O sistema deve confirmar a atualização com uma mensagem de sucesso
- [ ] A edição não deve apagar o histórico de pedidos vinculados ao cliente

---

## EP02 — Gestão de Pedidos

### US04 — Registrar novo pedido

**Como** administrador,
**quero** registrar um novo pedido vinculado a um cliente,
**para que** o fluxo de produção seja iniciado corretamente.

**Critérios de aceitação:**
- [ ] O pedido deve estar obrigatoriamente vinculado a um cliente
- [ ] O sistema deve gerar automaticamente um código único para o pedido (ex: PED-1023)
- [ ] O formulário deve permitir adicionar múltiplas peças ao pedido
- [ ] Cada peça deve conter: modelo da estampa, tipo de manga, tamanho, nome personalizado e valor unitário
- [ ] O pedido deve registrar a data de entrada e a previsão de entrega
- [ ] O sistema deve confirmar o registro com uma mensagem de sucesso

---

### US05 — Adicionar peças ao pedido

**Como** administrador,
**quero** adicionar diversas peças com características diferentes em um mesmo pedido,
**para que** pedidos variados sejam registrados corretamente.

**Critérios de aceitação:**
- [ ] Deve ser possível adicionar múltiplas peças em um único pedido
- [ ] Cada peça deve ter: modelo, tipo de manga, tamanho, nome personalizado e valor unitário
- [ ] O sistema deve exibir o resumo das peças adicionadas antes de confirmar o pedido
- [ ] Deve ser possível remover ou editar uma peça antes da confirmação

---

### US06 — Visualizar lista de pedidos

**Como** administrador,
**quero** visualizar todos os pedidos registrados,
**para que** eu tenha uma visão geral do que está em produção e do que já foi concluído.

**Critérios de aceitação:**
- [ ] A listagem deve exibir: código do pedido, nome do cliente, data de entrada, etapa atual e status
- [ ] Deve ser possível filtrar pedidos por status (em produção, concluído)
- [ ] Deve ser possível buscar um pedido pelo código ou nome do cliente
- [ ] Os pedidos devem ser ordenados do mais recente para o mais antigo por padrão

---

### US07 — Visualizar detalhes de um pedido

**Como** administrador,
**quero** visualizar todos os detalhes de um pedido específico,
**para que** eu possa conferir as informações completas quando necessário.

**Critérios de aceitação:**
- [ ] A tela deve exibir: código, cliente, data de entrada, previsão de entrega, etapa atual e lista de peças
- [ ] A lista de peças deve mostrar todas as características de cada item
- [ ] O histórico de etapas concluídas deve ser exibido com data e horário de cada atualização

---

### US08 — Registrar previsão de entrega

**Como** administrador,
**quero** definir a previsão de entrega no momento do cadastro do pedido,
**para que** o cliente saiba quando seu pedido ficará pronto.

**Critérios de aceitação:**
- [ ] A previsão de entrega deve ser um campo obrigatório no cadastro do pedido
- [ ] A data deve ser selecionada por um calendário (date picker)
- [ ] A previsão deve ser exibida na página de consulta pública

---

## EP03 — Controle de Produção

### US09 — Avançar etapa de produção

**Como** funcionária de produção,
**quero** atualizar a etapa atual de um pedido com o mínimo de passos possível,
**para que** o status seja sempre mantido em dia sem atrapalhar o trabalho.

**Critérios de aceitação:**
- [ ] A funcionária deve visualizar os pedidos em produção ao abrir o sistema
- [ ] Cada pedido deve ter um botão destacado "Concluir etapa atual"
- [ ] Ao clicar, deve aparecer uma confirmação simples antes de avançar
- [ ] O sistema deve avançar automaticamente para a próxima etapa após a confirmação
- [ ] A ação deve ser concluída em no máximo 2 toques na tela
- [ ] A atualização deve ser refletida imediatamente na listagem

---

### US10 — Visualizar pedidos em produção

**Como** funcionária de produção,
**quero** visualizar apenas os pedidos que estão ativamente em produção,
**para que** eu foque somente no que precisa ser feito.

**Critérios de aceitação:**
- [ ] A tela deve listar apenas pedidos com status "em produção"
- [ ] Cada item deve exibir: código do pedido, cliente, etapa atual e previsão de entrega
- [ ] A interface deve ser adaptada para uso em dispositivos móveis
- [ ] Os pedidos mais urgentes (próximos ao prazo) devem aparecer primeiro

---

### US11 — Visualizar detalhes do pedido na produção

**Como** funcionária de produção,
**quero** visualizar as peças e detalhes de um pedido durante a produção,
**para que** eu execute o trabalho corretamente sem depender de papéis ou cadernos.

**Critérios de aceitação:**
- [ ] A tela de detalhe deve exibir: código, cliente, lista de peças com características e etapa atual
- [ ] As informações devem ser legíveis em tela de celular
- [ ] Deve haver um botão de acesso rápido para avançar a etapa (US09)

---

### US12 — Registrar pedido como concluído

**Como** funcionária de produção ou administrador,
**quero** marcar um pedido como concluído ao final da última etapa,
**para que** ele saia da fila de produção e fique registrado no histórico.

**Critérios de aceitação:**
- [ ] O pedido deve ser marcado como concluído ao avançar da última etapa (Pedido pronto para retirada)
- [ ] A data de conclusão deve ser registrada automaticamente
- [ ] O pedido concluído deve aparecer no histórico com status "Concluído"
- [ ] O status na página de consulta pública deve ser atualizado para "Pronto para retirada"

---

## EP04 — Consulta Pública de Pedidos

### US13 — Consultar pedido pelo código

**Como** cliente,
**quero** acessar uma página e digitar o número do meu pedido para ver o status,
**para que** eu acompanhe meu pedido sem precisar entrar em contato com a empresa.

**Critérios de aceitação:**
- [ ] A página deve ser pública, sem necessidade de login
- [ ] O cliente deve informar apenas o código do pedido para consultar
- [ ] O sistema deve exibir: código, status atual, etapa atual e previsão de entrega
- [ ] Caso o código não exista, deve exibir uma mensagem de erro clara
- [ ] A página deve funcionar corretamente em dispositivos móveis

---

### US14 — Visualizar linha do tempo de produção

**Como** cliente,
**quero** ver em qual etapa meu pedido está e quais etapas já foram concluídas,
**para que** eu entenda o progresso da produção de forma visual.

**Critérios de aceitação:**
- [ ] A linha do tempo deve exibir todas as 10 etapas do processo de produção
- [ ] Etapas concluídas devem ter indicação visual diferenciada (ex: ✔)
- [ ] A etapa atual deve ter indicação visual de "em andamento" (ex: ⏳)
- [ ] Etapas futuras devem aparecer como pendentes (ex: ⬜)
- [ ] A linha do tempo deve ser exibida de forma clara em tela de celular

---

### US15 — Consultar pedidos anteriores

**Como** cliente,
**quero** conseguir consultar pedidos antigos já concluídos,
**para que** eu tenha acesso ao histórico dos meus pedidos anteriores.

**Critérios de aceitação:**
- [ ] Pedidos concluídos devem ser consultáveis pelo código
- [ ] A consulta deve exibir: código, status (concluído), data de conclusão e lista de peças
- [ ] Não deve haver limite de tempo para consulta de pedidos antigos

---

## EP05 — Painel do Administrador

### US16 — Acessar painel administrativo com login

**Como** administrador,
**quero** acessar o sistema com usuário e senha,
**para que** somente pessoas autorizadas possam gerenciar os pedidos.

**Critérios de aceitação:**
- [ ] O sistema deve exigir e-mail e senha para acesso ao painel administrativo
- [ ] Tentativas de acesso com credenciais inválidas devem exibir mensagem de erro
- [ ] A sessão deve expirar após período de inatividade
- [ ] A página de consulta pública não deve exigir login

---

### US17 — Visualizar resumo geral no painel

**Como** administrador,
**quero** ver um resumo geral ao entrar no sistema,
**para que** eu tenha uma visão rápida do estado atual da produção.

**Critérios de aceitação:**
- [ ] O painel deve exibir: total de pedidos em produção, pedidos próximos ao prazo e pedidos concluídos no mês
- [ ] Deve haver acesso rápido para cadastrar novo pedido e visualizar todos os pedidos
- [ ] As informações devem ser atualizadas em tempo real

---

## EP06 — Painel da Funcionária de Produção

### US18 — Acessar painel de produção com login

**Como** funcionária de produção,
**quero** acessar o painel de produção com minhas credenciais,
**para que** eu tenha acesso apenas às funcionalidades necessárias para o meu trabalho.

**Critérios de aceitação:**
- [ ] O acesso deve ser feito com e-mail e senha
- [ ] Após o login, a funcionária deve ser direcionada diretamente para a lista de pedidos em produção
- [ ] A funcionária não deve ter acesso às funcionalidades administrativas (cadastro de clientes, relatórios)

---

## Itens Fora do Escopo Inicial

Os itens abaixo foram identificados mas não fazem parte do escopo da primeira versão do sistema:

- Controle de estoque
- Integração direta com API do WhatsApp
- Emissão de nota fiscal
- Relatórios avançados de produção
- Controle de status por peça individual
- Autenticação na página de consulta pública (número do pedido + telefone)
- Integração com loja virtual

---

## Resumo do Backlog

| ID | User Story | Épico | Prioridade |
|----|-----------|-------|------------|
| US01 | Cadastrar cliente | EP01 | Alta |
| US02 | Buscar cliente existente | EP01 | Alta |
| US03 | Editar dados do cliente | EP01 | Média |
| US04 | Registrar novo pedido | EP02 | Alta |
| US05 | Adicionar peças ao pedido | EP02 | Alta |
| US06 | Visualizar lista de pedidos | EP02 | Alta |
| US07 | Visualizar detalhes de um pedido | EP02 | Alta |
| US08 | Registrar previsão de entrega | EP02 | Alta |
| US09 | Avançar etapa de produção | EP03 | Alta |
| US10 | Visualizar pedidos em produção | EP03 | Alta |
| US11 | Visualizar detalhes do pedido na produção | EP03 | Alta |
| US12 | Registrar pedido como concluído | EP03 | Alta |
| US13 | Consultar pedido pelo código | EP04 | Alta |
| US14 | Visualizar linha do tempo de produção | EP04 | Média |
| US15 | Consultar pedidos anteriores | EP04 | Média |
| US16 | Acessar painel administrativo com login | EP05 | Alta |
| US17 | Visualizar resumo geral no painel | EP05 | Média |
| US18 | Acessar painel de produção com login | EP06 | Alta |
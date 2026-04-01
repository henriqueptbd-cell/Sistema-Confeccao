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
| EP07 | Módulo Financeiro |
| EP08 | Relatórios |

---

## EP01 — Gestão de Clientes

### US01 — Cadastrar cliente

**Como** administrador,
**quero** cadastrar um novo cliente no sistema,
**para que** eu possa vinculá-lo a um pedido.

**Critérios de aceitação:**
- [ ] O formulário deve suportar **Pessoa Física** e **Pessoa Jurídica** — os campos mudam conforme o tipo selecionado
- [ ] Pessoa Física: nome completo, CPF, telefone, email (opcional), endereço completo
- [ ] Pessoa Jurídica: razão social, nome fantasia (opcional), CNPJ, inscrição estadual (opcional), telefone, email (opcional), endereço completo
- [ ] CPF e CNPJ devem ser validados antes de salvar
- [ ] O CEP deve preencher automaticamente logradouro, bairro, município e UF via ViaCEP
- [ ] O formulário deve ser um componente reutilizável (`<ModalNovoCliente />`) acionável de qualquer tela via callback `onSalvar(cliente)`
- [ ] Na tela de pedido, ao salvar via modal, o cliente já fica selecionado automaticamente no pedido
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
- [ ] O pedido deve estar obrigatoriamente vinculado a um cliente (busca em tempo real; se não encontrado, abre modal de cadastro)
- [ ] O sistema deve gerar automaticamente um número sequencial único para consulta pública
- [ ] O formulário deve permitir adicionar múltiplas peças ao pedido
- [ ] O pedido deve registrar a data de entrada e a previsão de entrega
- [ ] O valor total do pedido deve ser calculado automaticamente com base nas peças
- [ ] O sistema deve confirmar o registro com uma mensagem de sucesso

---

### US05 — Adicionar peças ao pedido

**Como** administrador,
**quero** adicionar diversas peças com características diferentes em um mesmo pedido,
**para que** pedidos variados sejam registrados corretamente.

**Critérios de aceitação:**
- [ ] Deve ser possível adicionar múltiplas peças em um único pedido; botão "Adicionar mais peças" fica no final da lista
- [ ] Tipos de produto suportados: **Camiseta**, **Short**, **Corta-vento**, **Bandeira**
- [ ] **Camiseta:** material (Dry / Confort UV50 / Crepe / PV), manga (curta / longa / regata), gola, punho (só manga longa), dedão (só manga longa), capuz/balaclava (só manga longa, mutuamente exclusivos)
- [ ] **Short:** modelo (Jet masc. / Jet fem. / Futebol), bolso com zíper (sim/não)
- [ ] **Corta-vento:** com toca ou sem toca
- [ ] **Bandeira:** dimensões em campo livre (máx. 90×70cm), 1 ou 2 faces, campo de observações
- [ ] Tamanhos selecionáveis por grupo: Adulto masc. (P–EXG), Adulto fem./Babylook (BLP–BLXG), Infantil (2–16); Corta-vento sem versão feminina
- [ ] Estampa: Personalizado (campo de texto livre) / Olívia (campo de cor) / Amaury (campo de cor); novos modelos cadastráveis pelo admin
- [ ] Campo para anexar imagens de referência (uma ou mais)
- [ ] O valor da peça deve ser calculado automaticamente com base na precificação configurada
- [ ] Deve ser possível remover ou editar uma peça antes de salvar o pedido

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

---

## EP07 — Módulo Financeiro

### US19 — Precificação dinâmica na tela de pedido

**Como** administrador,
**quero** que o valor de cada peça seja calculado automaticamente conforme as opções são selecionadas,
**para que** eu não precise calcular manualmente e cometa menos erros.

**Critérios de aceitação:**
- [ ] O valor é calculado com a fórmula: `(preço base + adicionais) × (1 − desconto%)`
- [ ] O valor é atualizado em tempo real conforme as opções são selecionadas
- [ ] Exibe subtotal antes do desconto e valor final após o desconto
- [ ] Campo de percentual de desconto visível no formulário da peça
- [ ] Se o desconto exceder o limite configurado, o sistema bloqueia e exibe aviso

---

### US20 — Painel de configuração de preços

**Como** administrador,
**quero** configurar os preços base e adicionais de cada produto,
**para que** o sistema calcule os valores corretamente sem precisar alterar o código.

**Critérios de aceitação:**
- [ ] Tela dedicada de configurações exibe tabela com todos os preços base por produto/variação
- [ ] Tela exibe tabela com todos os adicionais e seus valores
- [ ] Campo para configurar o limite máximo de desconto permitido (global, em %)
- [ ] Alterações afetam apenas novos pedidos — pedidos já criados mantêm o valor registrado
- [ ] Acesso restrito ao Administrador

---

### US21 — Registrar compras de material

**Como** administrador,
**quero** registrar cada compra de material realizada,
**para que** eu tenha controle dos custos com insumos.

**Critérios de aceitação:**
- [ ] Formulário com: data, material, quantidade, unidade, valor total, fornecedor (opcional), observações (opcional)
- [ ] Listagem de compras filtráveis por período
- [ ] Qualquer compra pode ser editada ou excluída pelo administrador

---

### US22 — Registrar salários mensais

**Como** administrador,
**quero** registrar o salário mensal de cada funcionária,
**para que** os custos com pessoal entrem no resultado financeiro.

**Critérios de aceitação:**
- [ ] Formulário com: funcionária, mês/ano de referência, valor, observações (opcional)
- [ ] Um registro por funcionária por mês (sem duplicatas)
- [ ] Editável pelo administrador

---

## EP08 — Relatórios

### US23 — Visualizar relatório financeiro por período

**Como** administrador,
**quero** consultar o desempenho financeiro da confecção em qualquer intervalo de datas,
**para que** eu entenda a saúde financeira da empresa com flexibilidade.

**Critérios de aceitação:**
- [ ] Seletor de período com data início + data fim (padrão: 1º do mês atual até hoje)
- [ ] Atalhos rápidos: Esta semana, Este mês, Mês anterior, Últimos 30 dias
- [ ] Todos os blocos reagem ao mesmo intervalo simultaneamente

---

### US24 — Navegar entre visões de relatório (presets)

**Como** administrador,
**quero** alternar rapidamente entre visões predefinidas do relatório,
**para que** eu acesse a informação que preciso sem configurar manualmente.

**Critérios de aceitação:**
- [ ] Preset **Consolidado**: Vendas (Recebidos) + Compras + Salários
- [ ] Preset **Vendas**: apenas bloco de Vendas com subcategorias A Receber / Entregues / Recebidos
- [ ] Preset **Compras**: apenas bloco de Compras de Materiais
- [ ] Preset **Salários**: apenas bloco de Salários
- [ ] Preset **Personalizado**: escolha livre de blocos e subcategorias de vendas
- [ ] Resumo Consolidado exibido quando 2 ou mais blocos estão ativos

---

### US25 — Visualizar subcategorias de vendas

**Como** administrador,
**quero** ver as vendas divididas em A Receber, Entregues e Recebidos,
**para que** eu entenda o fluxo de caixa real e projetado.

**Critérios de aceitação:**
- [ ] **A Receber**: pedidos fechados com `pagamento_status = 'pendente'`
- [ ] **Entregues**: pedidos com `entrega_status = 'entregue'`
- [ ] **Recebidos**: pedidos com `pagamento_status = 'confirmado'`
- [ ] Subcategorias não são mutuamente exclusivas (pedido pode estar Entregue e A Receber)
- [ ] Resultado Real usa apenas Recebidos; Resultado Previsto inclui A Receber
- [ ] Administrador pode confirmar pagamento e entrega diretamente no sistema

---

### US26 — Imprimir relatório

**Como** administrador,
**quero** imprimir qualquer visão do relatório com formatação profissional,
**para que** eu possa arquivar ou compartilhar o resultado em papel.

**Critérios de aceitação:**
- [ ] Botão "Imprimir" disponível na tela de Relatórios
- [ ] Cabeçalho gerado automaticamente com nome da empresa, título e período
- [ ] Elementos de navegação (sidebar, topbar, botões, filtros) ocultados na impressão via `@media print`
- [ ] Hook `usePrint()` reutilizável em qualquer tela do sistema

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
| US01 | Cadastrar cliente (PF/PJ, CEP auto, modal reutilizável) | EP01 | Alta |
| US02 | Buscar cliente existente | EP01 | Alta |
| US03 | Editar dados do cliente | EP01 | Média |
| US04 | Registrar novo pedido | EP02 | Alta |
| US05 | Adicionar peças ao pedido (catálogo completo) | EP02 | Alta |
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
| US19 | Precificação dinâmica na tela de pedido | EP07 | Alta |
| US20 | Painel de configuração de preços | EP07 | Média |
| US21 | Registrar compras de material | EP07 | Média |
| US22 | Registrar salários mensais | EP07 | Média |
| US23 | Visualizar relatório financeiro por período | EP08 | Média |
| US24 | Navegar entre visões de relatório (presets) | EP08 | Média |
| US25 | Visualizar subcategorias de vendas | EP08 | Média |
| US26 | Imprimir relatório | EP08 | Baixa |
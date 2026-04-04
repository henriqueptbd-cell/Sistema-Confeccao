# Manual de Uso — Sistema FCamargo

**Versão 1.0**  
Sistema de gestão de pedidos para confecção e estamparia.

---

## Índice

1. [Acesso ao sistema](#1-acesso-ao-sistema)
2. [Painel de pedidos (Dashboard)](#2-painel-de-pedidos-dashboard)
3. [Cadastrar um novo pedido](#3-cadastrar-um-novo-pedido)
4. [Acompanhar a produção de um pedido](#4-acompanhar-a-produção-de-um-pedido)
5. [Marcar pedido como entregue](#5-marcar-pedido-como-entregue)
6. [Excluir um pedido](#6-excluir-um-pedido)
7. [Clientes](#7-clientes)
8. [Financeiro](#8-financeiro)
   - 8.1 [Compras de material](#81-compras-de-material)
   - 8.2 [Folha do mês](#82-folha-do-mês)
   - 8.3 [Custos adicionais de pessoal](#83-custos-adicionais-de-pessoal)
   - 8.4 [Custos fixos](#84-custos-fixos)
   - 8.5 [Parcelamentos](#85-parcelamentos)
   - 8.6 [Funcionárias](#86-funcionárias)
9. [Relatórios](#9-relatórios)
10. [Configurações](#10-configurações)
    - 10.1 [Tabela de preços](#101-tabela-de-preços)
    - 10.2 [Usuários](#102-usuários)
11. [Consulta pública de pedidos](#11-consulta-pública-de-pedidos)
12. [Logout e segurança](#12-logout-e-segurança)

---

## 1. Acesso ao sistema

**Como entrar no sistema:**

1. Acesse o endereço do sistema no navegador
2. Digite seu **e-mail** e **senha**
3. Clique em **Entrar**

**Perfis de acesso:**

| Perfil | O que pode fazer |
|--------|-----------------|
| **Administrador** | Acesso completo: pedidos, clientes, financeiro, relatórios e configurações |
| **Produção** | Acesso a pedidos e clientes apenas |

> Se esquecer a senha, fale com o administrador do sistema para que ele redefina no cadastro de usuários.

---

## 2. Painel de pedidos (Dashboard)

A primeira tela após o login é o **painel de pedidos**. Aqui você vê todos os pedidos ativos da empresa.

**O que aparece na tela:**

- **Em produção** — quantidade de pedidos que estão sendo fabricados
- **Próximos do prazo** — pedidos com prazo vencido ou vencendo em até 2 dias (aparece em vermelho com ⚠️)
- **Concluídos** — pedidos prontos para retirada

**Abas disponíveis:**

- **Pedidos ativos** — todos os pedidos em produção ou concluídos aguardando retirada
- **Finalizados** — pedidos que já foram entregues ao cliente

**Filtros:**

- **Todos** — mostra todos os pedidos ativos
- **Em produção** — mostra apenas os que ainda estão sendo fabricados
- **Concluídos** — mostra apenas os que estão prontos para retirada

**Busca em finalizados:**  
Na aba Finalizados, use o campo de busca para encontrar um pedido pelo nome do cliente ou número do pedido.

**Para abrir um pedido:** clique em qualquer linha da tabela ou no botão **Ver**.

---

## 3. Cadastrar um novo pedido

1. No painel de pedidos, clique no botão **+ Novo pedido** (canto superior direito)
2. Preencha os dados:

**Dados do pedido:**
- **Cliente** — digite o nome, CPF ou CNPJ para buscar. Se o cliente não estiver cadastrado, clique em **+ Cadastrar como novo cliente** que aparece na lista
- **Previsão de entrega** — selecione a data combinada com o cliente

**Produtos:**

Clique no tipo de produto desejado:

**Camiseta**
- Escolha o material (Dry, Confort UV50, Crepe, PV)
- Escolha o modelo (Manga curta, Manga longa, Regata)
- Escolha a gola
- Se for manga longa: defina punho, capuz e se terá dedão
- Escolha o tipo de estampa
- Preencha as quantidades por tamanho (Masculino, Feminino, Infantil)
- Se quiser aplicar desconto, preencha o campo Desconto (%)

**Short**
- Escolha o modelo (Jet masculino, Jet feminino, Futebol)
- Marque se terá bolso com zíper
- Preencha as quantidades por tamanho

**Corta-vento**
- Escolha o modelo (Com toca, Sem toca)
- Preencha as quantidades por tamanho

**Bandeira**
- Escolha o material
- Informe as medidas (máx. 90×70cm)
- Escolha o número de faces
- Informe a quantidade

**Serviço avulso**  
Use quando for um serviço parcial para outra confecção (ex: só a impressão, só o corte):
- Descreva o serviço
- Informe a quantidade
- Informe o valor unitário manualmente

> O preço é calculado automaticamente para os produtos do catálogo (Camiseta, Short, Corta-vento, Bandeira). Para Serviço avulso, o valor é informado manualmente.

**Para adicionar mais de um produto no mesmo pedido:** clique em **+ Adicionar produto**.

**Para remover um produto:** clique em **× Remover** no canto do card do produto.

**Para salvar o pedido:** clique em **Salvar pedido**.

---

## 4. Acompanhar a produção de um pedido

Clique em um pedido no painel para abrir seus detalhes.

**O que aparece:**
- Dados do cliente, telefone, data de entrada e prazo de entrega
- Etapa atual da produção
- Linha do tempo com todas as 10 etapas
- Lista de peças com tamanhos e valores

**As 10 etapas de produção:**

1. Entrada do pedido
2. Montagem da estampa
3. Impressão
4. Corte
5. Estampa
6. Triagem para costura
7. Costura
8. Arremate
9. Conferência
10. Pronto para retirada

**Como avançar uma etapa:**

1. Abra o pedido
2. Na Linha do Tempo, localize a etapa atual (marcada com ●)
3. Clique em **✓ Concluir**
4. A etapa é marcada como concluída e a próxima fica ativa automaticamente

**Como desfazer a última etapa concluída:**

1. Abra o pedido
2. Na Linha do Tempo, localize a última etapa concluída
3. Clique em **↩ Desfazer**

> Só é possível desfazer a etapa mais recente. Etapas anteriores não podem ser desfeitas.

Quando a etapa **Conferência** (etapa 9) for concluída, o pedido muda automaticamente para o status **Pronto para retirada**.

---

## 5. Marcar pedido como entregue

Quando o cliente vier buscar o pedido:

1. Abra o pedido (ele deve estar com status **Pronto para retirada**)
2. Clique no botão verde **Marcar como entregue**
3. Confirme a ação

O pedido sai dos pedidos ativos e vai para a aba **Finalizados** no painel.

> Só é possível marcar como entregue se o pedido estiver com status **Pronto para retirada**. Se a produção não estiver completa, conclua todas as etapas primeiro.

---

## 6. Excluir um pedido

1. Abra o pedido que deseja excluir
2. Clique em **Excluir pedido** (canto superior direito)
3. Confirme a ação

> **Atenção:** a exclusão é permanente e não pode ser desfeita. Use apenas se o pedido foi cadastrado por engano.

---

## 7. Clientes

No menu lateral, clique em **Clientes**.

**Cadastrar um novo cliente:**

1. Clique em **+ Novo cliente**
2. Escolha o tipo: **Pessoa Física** (CPF) ou **Pessoa Jurídica** (CNPJ)
3. Preencha os dados:
   - Nome / Razão social
   - CPF ou CNPJ
   - Telefone
   - CEP — ao digitar o CEP, o endereço é preenchido automaticamente
   - Complemento (opcional)
4. Clique em **Salvar**

**Buscar um cliente:**  
Use o campo de busca no topo para encontrar por nome, CPF ou CNPJ.

**Editar um cliente:**  
Clique em **Editar** na linha do cliente.

**Excluir um cliente:**  
Clique em **Excluir** na linha do cliente e confirme.

> Clientes podem ser cadastrados também diretamente durante a criação de um pedido, sem precisar ir até a tela de Clientes.

---

## 8. Financeiro

> Disponível apenas para **Administradores**.

No menu lateral, clique em **Financeiro**. Use o seletor de **Período** (mês e ano) no topo para filtrar os dados de cada aba.

---

### 8.1 Compras de material

Registre aqui todas as compras de insumos (tecidos, embalagens, ferramentas, etc.).

**Registrar uma nova compra:**

1. Clique em **+ Nova compra**
2. Preencha:
   - Data da compra
   - Material (ex: Dry, Crepe, linha...)
   - Tipo (Matéria-prima, Embalagem, Ferramentas, Outros)
   - Quantidade e unidade (kg, metros, unid.)
   - Valor total pago
   - Fornecedor (opcional)
   - Observações (opcional)
3. Clique em **Salvar**

**Filtrar compras:**  
Use o filtro de **Tipo** e o campo de busca para encontrar compras específicas.

**Editar ou excluir:** clique nos botões **Editar** ou **Excluir** na linha da compra.

---

### 8.2 Folha do mês

Registre aqui os pagamentos de salário de cada funcionária no mês.

**Registrar um pagamento:**

1. Na linha da funcionária, clique em **Registrar** (se ainda não foi pago) ou **Editar** (para corrigir)
2. Preencha a data de pagamento, o valor pago e observações
3. Clique em **Salvar**

A coluna **Status** mostra se cada funcionária já foi paga no mês selecionado.

> Para que as funcionárias apareçam nesta tela, elas precisam estar cadastradas na aba **Funcionárias**.

---

### 8.3 Custos adicionais de pessoal

Registre gastos extras com funcionárias que não são salário fixo (ajuda de custo, bônus, vale, etc.).

**Adicionar um custo:**

1. Clique em **+ Adicionar custo**
2. Selecione a funcionária
3. Preencha a data, descrição e valor
4. Clique em **Salvar**

---

### 8.4 Custos fixos

Gerencie as despesas fixas mensais da empresa (aluguel, energia, internet, etc.).

**Duas seções nesta aba:**

**Tipos de custo fixo** — são as categorias de despesa (cadastradas uma vez):
1. Clique em **+ Novo tipo**
2. Preencha nome, categoria e dia de vencimento
3. Clique em **Salvar**

> Os tipos cadastrados geram automaticamente um registro mensal para dar baixa.

**Registros do mês** — são os pagamentos mensais de cada tipo:
1. Na linha do registro, clique em **Dar baixa**
2. Preencha a data de pagamento, valor pago e observações
3. Clique em **Salvar**

---

### 8.5 Parcelamentos

Controle compras parceladas no cartão ou a prazo (ex: máquina de costura, reforma).

**Cadastrar um parcelamento:**

1. Clique em **+ Novo parcelamento**
2. Preencha descrição, valor total, número de parcelas e data da 1ª parcela
3. Clique em **Salvar**

O sistema cria automaticamente todas as parcelas com as datas previstas.

**Registrar o pagamento de uma parcela:**

1. Clique em **▶ Detalhes** para expandir o parcelamento
2. Na linha da parcela pendente, clique em **Pagar**
3. Preencha a data e o valor pago
4. Clique em **Registrar pagamento**

Quando todas as parcelas forem pagas, o status muda para **Quitado**.

---

### 8.6 Funcionárias

Mantenha o cadastro das funcionárias da empresa.

**Cadastrar uma funcionária:**

1. Clique em **+ Novo funcionário**
2. Preencha nome, cargo, telefone, salário base e data de admissão
3. Clique em **Salvar**

**Editar ou excluir:** clique nos botões correspondentes na linha da funcionária.

> O salário base cadastrado aqui é sugerido automaticamente ao registrar o pagamento na **Folha do mês**.

---

## 9. Relatórios

> Disponível apenas para **Administradores**.

No menu lateral, clique em **Relatórios**.

**Definir o período:** use os campos de data para selecionar o intervalo desejado.

**Presets disponíveis:**

| Preset | O que mostra |
|--------|-------------|
| Consolidado | Tudo junto: vendas, compras, folha, custos fixos e parcelas |
| Vendas | Apenas os pedidos no período |
| Compras | Apenas as compras de material |
| Folha de pessoal | Salários e custos adicionais |
| Personalizado | Você escolhe quais blocos exibir |

**Resumo consolidado:**  
Ao usar o preset Consolidado, o sistema calcula:
- **Resultado real** — receita de pedidos entregues menos todos os custos
- **Previsto** — inclui também os pedidos concluídos (prontos mas não entregues)

**Filtros de vendas:**  
Na seção de vendas, você pode exibir pedidos em produção, concluídos e/ou entregues separadamente.

---

## 10. Configurações

> Disponível apenas para **Administradores**.

---

### 10.1 Tabela de preços

Define os preços base usados no cálculo automático dos pedidos.

**Como atualizar um preço:**

1. Vá em **Configurações → Tabela de preços**
2. Localize o produto e modelo que deseja alterar
3. Altere o valor no campo correspondente
4. Clique em **Salvar**

Os preços atualizados passam a valer imediatamente para novos pedidos. Pedidos já cadastrados não são alterados.

**Desconto máximo:**  
Define o percentual máximo de desconto que pode ser aplicado em qualquer peça. Se alguém tentar colocar um desconto maior, o sistema limita ao máximo configurado.

---

### 10.2 Usuários

Gerencie quem tem acesso ao sistema.

**Cadastrar um novo usuário:**

1. Vá em **Configurações → Usuários**
2. Clique em **+ Novo usuário**
3. Preencha nome, e-mail, senha e perfil:
   - **Administrador** — acesso completo
   - **Produção** — acesso apenas a pedidos e clientes
4. Clique em **Salvar**

**Editar um usuário:**  
Clique em **Editar**. Para não alterar a senha, deixe o campo de senha em branco.

**Excluir um usuário:**  
Clique em **Excluir** e confirme.

---

## 11. Consulta pública de pedidos

O cliente pode consultar o status do próprio pedido sem precisar ligar, pelo link:

```
https://sistema-confeccao-tiyg.onrender.com/consulta
```

**Como o cliente usa:**

1. Acessa o link acima no celular ou computador
2. Digita o número do pedido (informado no momento do cadastro)
3. Vê a linha do tempo completa com as etapas concluídas e a etapa atual

Não é necessário login. Qualquer pessoa com o número do pedido pode consultar.

---

## 12. Logout e segurança

**Como sair do sistema:**  
Clique em **Sair** no menu lateral (ícone de porta na parte inferior).

**Logout automático:**  
Por segurança, o sistema desconecta automaticamente após **30 minutos sem atividade**. Ao voltar, será necessário fazer login novamente.

> Nunca compartilhe sua senha. Cada usuário deve ter seu próprio acesso cadastrado pelo administrador.

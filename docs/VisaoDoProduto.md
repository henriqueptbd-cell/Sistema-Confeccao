# Visão do Produto

## 1. Nome do Projeto

Sistema de Gestão de Produção para Confecção de Roupas Personalizadas

---

## 2. Problema

Atualmente a confecção controla seus pedidos de forma manual, utilizando anotações em cadernos e pastas físicas contendo os detalhes de cada pedido.

Esse modelo apresenta alguns problemas:

- Dependência excessiva dos proprietários para organizar e acompanhar os pedidos
- Dificuldade para visualizar o andamento da produção
- Falta de centralização das informações
- Dificuldade para funcionárias saberem quais pedidos estão em produção
- Impossibilidade de clientes acompanharem o status do pedido sem contato direto

Esse cenário limita a organização da produção e dificulta o crescimento da empresa.

---

## 3. Objetivo do Sistema

Criar um sistema digital que permita registrar pedidos, acompanhar o processo de produção e facilitar a comunicação com os clientes.

O sistema deverá permitir:

- Cadastro de clientes
- Cadastro e gerenciamento de pedidos
- Registro detalhado das peças dentro de cada pedido
- Acompanhamento das etapas de produção
- Atualização do progresso pelas funcionárias
- Consulta do status do pedido pelos clientes por meio de uma página pública de consulta online
- Visualização geral da produção pelos administradores

---

## 4. Usuários do Sistema

O sistema terá três tipos principais de usuários:

### Administrador

Responsável pela gestão do sistema.

Funções principais:

- Cadastrar clientes
- Cadastrar pedidos
- Acompanhar produção
- Visualizar relatórios
- Gerenciar usuários

---

### Funcionárias de Produção

Responsáveis por atualizar o andamento da produção.

Funções principais:

- Visualizar pedidos em produção
- Iniciar etapas da produção
- Finalizar etapas da produção
- Atualizar status dos pedidos

O acesso será feito principalmente por dispositivos móveis através do navegador.

---

### Cliente

Responsável por consultar o andamento do pedido.

Funções principais:

- Consultar status do pedido
- Visualizar previsão de entrega
- Visualizar linha do tempo das etapas de produção

A consulta será realizada por meio de uma **página pública de consulta online**, acessível via link compartilhado pela empresa pelo WhatsApp. O cliente informa o código do pedido e visualiza o status atual sem necessidade de login.

---

## 5. Escopo Inicial (MVP)

A primeira versão do sistema terá foco nas funcionalidades essenciais para organização da produção.

Funcionalidades iniciais:

- Cadastro de clientes
- Cadastro de pedidos com geração automática de código único (ex: `PED-1023`)
- Cadastro das peças dentro do pedido
- Acompanhamento das etapas da produção
- Visualização de pedidos em andamento
- Consulta pública do status do pedido por código
- Linha do tempo visual das etapas de produção

Funcionalidades mais avançadas poderão ser implementadas em versões futuras.

---

## 6. Benefícios Esperados

A implementação do sistema deve trazer os seguintes benefícios:

- Organização centralizada das informações
- Maior controle sobre os pedidos em produção
- Redução da dependência de processos manuais
- Melhor comunicação com clientes
- Maior escalabilidade para crescimento da empresa

---

## 7. Possíveis Expansões Futuras

O sistema poderá evoluir para incluir:

- Integração com emissão de nota fiscal
- Controle de estoque de materiais
- Integração com loja virtual
- Relatórios avançados de produção
- Controle financeiro de pedidos
- Autenticação na consulta do cliente (código do pedido + telefone)
- Integração direta com API do WhatsApp

Essas funcionalidades não fazem parte do escopo inicial, mas foram consideradas no planejamento do sistema.
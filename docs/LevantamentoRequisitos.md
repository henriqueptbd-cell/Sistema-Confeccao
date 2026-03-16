# Levantamento de Requisitos

## 1. Contexto do Negócio

A empresa atua na produção de roupas personalizadas, principalmente camisetas para grupos, empresas e eventos.

Os pedidos são recebidos atualmente por WhatsApp ou presencialmente e registrados manualmente em cadernos. Após o registro, são criadas pastas físicas contendo os detalhes do pedido.

Esse modelo torna a organização da produção dependente dos proprietários, dificultando o acompanhamento geral dos pedidos e a coordenação do trabalho quando os responsáveis não estão presentes.

O sistema proposto visa digitalizar esse processo, centralizando as informações e organizando o fluxo de produção.

---

## 2. Usuários do Sistema

### Administrador
Responsável pela gestão geral do sistema.

Principais ações:
- Cadastrar clientes
- Registrar pedidos
- Acompanhar produção
- Visualizar relatórios

### Funcionária de Produção
Responsável por executar as etapas da produção.

Principais ações:
- Visualizar pedidos em produção
- Iniciar etapas de produção
- Finalizar etapas de produção
- Atualizar status das peças

> O acesso será feito principalmente por dispositivos móveis.

### Cliente
Responsável por consultar o andamento do pedido.

Principais ações:
- Consultar status do pedido
- Verificar previsão de entrega
- Visualizar histórico de pedidos anteriores

> A consulta será realizada por meio de uma página pública de consulta online (ver seção 7).

---

## 3. Processo de Produção

O fluxo atual de produção segue as seguintes etapas:

1. Entrada do pedido
2. Montagem da estampa
3. Impressão
4. Corte
5. Estampa
6. Triagem para costura
7. Costura
8. Arremate
9. Conferência
10. Pedido pronto para retirada

Cada etapa deve ser registrada no sistema para permitir o acompanhamento do progresso da produção.

---

## 4. Estrutura dos Pedidos

Cada pedido possui um **código único de identificação** (ex: `PED-1023`) gerado automaticamente pelo sistema no momento do cadastro. Esse código é utilizado tanto internamente quanto pelo cliente para consulta.

Cada pedido pode conter diversas peças com características diferentes.

Cada peça pode possuir:
- Modelo da estampa
- Tipo de manga (curta ou longa)
- Tamanho
- Nome personalizado na estampa
- Valor unitário
- Status de produção

Os pedidos podem variar de uma única peça até centenas de unidades.

> ⚠️ **Decisão em aberto:** o controle de produção será feito por **pedido** (acompanhamento geral) ou por **peça individual** (cada camiseta tem seu próprio status)? Essa definição impacta diretamente a modelagem do banco de dados.

---

## 5. Materiais e Produtos

A empresa trabalha com diferentes tipos de tecido, entre eles:
- PV
- Dry Fit
- Confort UV50
- Gabardine
- Corta Vento

Produtos oferecidos:
- Camisetas
  - Manga curta
  - Manga longa
  - Regata
- Shorts
  - Masculino
  - Feminino
- Corta vento

> O controle de estoque não faz parte do escopo inicial do sistema.

---

## 6. Volume de Produção

Em média:
- 1 a 5 pedidos por dia
- Cerca de 10 a 50 peças por pedido
- Podendo chegar a pedidos maiores

O prazo médio de produção varia entre 15 e 20 dias.

---

## 7. Consulta de Pedido pelo Cliente

O cliente poderá acompanhar o andamento do pedido através de uma **página pública de consulta online**, acessível por qualquer dispositivo.

O acesso ao sistema de consulta poderá ser compartilhado manualmente via WhatsApp pela empresa, enviando o link da página ao cliente.

Para realizar a consulta, o cliente deverá informar o **número do pedido** fornecido no momento do registro.

A página retornará informações como:
- Status atual do pedido
- Etapa atual da produção
- Previsão de entrega
- Linha do tempo das etapas de produção (visual)
- Histórico de pedidos anteriores do cliente

Essa abordagem permite que clientes consultem tanto pedidos em produção quanto pedidos já concluídos.

### Linha do tempo de produção (exemplo)

```
Pedido #1023

✔ Pedido recebido
✔ Estampa preparada
✔ Impressão realizada
⏳ Costura
⬜ Conferência
⬜ Pedido pronto
```

### Segurança (opcional)
Para maior segurança, a consulta poderá exigir além do número do pedido, o número de telefone do cliente cadastrado. Essa funcionalidade é opcional e pode ser implementada em versão futura.

---

## 8. Histórico de Pedidos

O sistema deverá manter registro de todos os pedidos, organizados por situação:
- Pedidos em produção
- Pedidos concluídos
- Pedidos antigos

Isso permite consulta de pedidos anteriores tanto pelo cliente quanto pelo administrador.

---

## 9. Possíveis Evoluções Futuras

O sistema poderá futuramente incluir:
- Controle de estoque
- Integração com loja virtual
- Emissão automática de nota fiscal
- Relatórios avançados de produção
- Autenticação na página de consulta (número do pedido + telefone)
- Integração direta com API do WhatsApp
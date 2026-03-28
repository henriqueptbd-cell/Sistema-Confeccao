# Cadastro de Clientes

## Visão Geral

O cadastro de clientes suporta **Pessoa Física** e **Pessoa Jurídica**. Os dados coletados são os necessários para emissão de nota fiscal. O acesso ao cadastro ocorre principalmente durante a criação de um pedido, mas o componente de cadastro é reutilizável em qualquer tela do sistema.

---

## Fluxo de Seleção/Cadastro

1. Na tela de pedido, o usuário digita no campo de busca
2. O sistema retorna clientes em tempo real
3. Se o cliente for encontrado → seleciona e continua
4. Se não for encontrado → botão **"Novo Cliente"** abre um modal **dentro da própria tela de pedido**
5. Após salvar, o cliente já fica selecionado no pedido automaticamente

---

## Componente Reutilizável de Cadastro

O formulário de novo cliente deve ser implementado como um **componente independente** (ex: `<ModalNovoCliente />`), podendo ser acionado de qualquer lugar do sistema:

- Tela de pedido — quando o cliente não é encontrado na busca
- Tela de clientes — botão "Novo Cliente" na listagem geral
- Qualquer outra tela futura que precise cadastrar um cliente

O componente recebe uma função de callback `onSalvar(cliente)` para que cada tela saiba o que fazer após o cadastro (ex: selecionar o cliente no pedido, atualizar a listagem, etc.).

---

## Campos do Formulário

### Tipo de Pessoa

Seletor obrigatório que altera dinamicamente os campos exibidos:

- `Pessoa Física`
- `Pessoa Jurídica`

---

### Pessoa Física

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome completo | Texto | Sim |
| CPF | Texto (máscara 000.000.000-00) | Sim |
| Telefone | Texto (máscara) | Sim |
| Email | Email | Não |
| CEP | Texto (máscara 00000-000) | Sim |
| Logradouro | Texto | Sim |
| Número | Texto | Sim |
| Complemento | Texto | Não |
| Bairro | Texto | Sim |
| Município | Texto | Sim |
| UF | Select (estados) | Sim |

---

### Pessoa Jurídica

| Campo | Tipo | Obrigatório |
|---|---|---|
| Razão Social | Texto | Sim |
| Nome Fantasia | Texto | Não |
| CNPJ | Texto (máscara 00.000.000/0000-00) | Sim |
| Inscrição Estadual | Texto | Não |
| Telefone | Texto (máscara) | Sim |
| Email | Email | Não |
| CEP | Texto (máscara 00000-000) | Sim |
| Logradouro | Texto | Sim |
| Número | Texto | Sim |
| Complemento | Texto | Não |
| Bairro | Texto | Sim |
| Município | Texto | Sim |
| UF | Select (estados) | Sim |

> O campo **Nome Fantasia** é incluído na busca, pois na prática o usuário lembrará do nome comercial e não da razão social.

---

## Preenchimento Automático por CEP

Ao informar o CEP, o sistema consulta a API **ViaCEP** e preenche automaticamente:

- Logradouro
- Bairro
- Município
- UF

O usuário só precisa preencher o número e o complemento manualmente.

```javascript
// Exemplo de consulta à ViaCEP
const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
const data = await res.json();
```

---

## Tela de Gerenciamento de Clientes

### Listagem

- Exibe todos os clientes cadastrados
- Possui campo de busca com as mesmas regras da busca no pedido
- Botão **"Novo Cliente"** que aciona o mesmo componente reutilizável `<ModalNovoCliente />`

### Edição

- Qualquer cliente pode ser editado
- Útil principalmente para completar dados que estejam faltando (ex: email, complemento)
- Abre o mesmo formulário de cadastro pré-preenchido com os dados atuais

### Exclusão

- **Só é permitida se o cliente não tiver nenhum pedido vinculado**
- Essa regra deve ser garantida tanto no backend quanto no banco de dados (restrição de chave estrangeira com `RESTRICT`)
- Se houver pedidos vinculados, exibe mensagem explicando o impedimento — sem opção de forçar exclusão

```sql
-- Garantia no banco de dados
ALTER TABLE pedidos
  ADD CONSTRAINT fk_pedidos_cliente
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
  ON DELETE RESTRICT;
```

---

## Busca de Clientes

### Comportamento

- Campo único — o usuário digita qualquer informação sem precisar escolher o tipo
- A busca abrange: **nome**, **razão social**, **nome fantasia**, **CPF** e **CNPJ**
- Insensível a maiúsculas/minúsculas
- Insensível a acentuação (ex: `"João"`, `"joao"` e `"JOÃO"` retornam o mesmo resultado)
- CPF/CNPJ: aceita com ou sem máscara (ex: `123.456.789-00` ou `12345678900`)

### Normalização de CPF/CNPJ

Antes de executar a query, o backend remove a máscara do texto digitado:

```javascript
const busca = input.replace(/[.\-\/]/g, ""); // remove . - /
```

### Query SQL (PostgreSQL)

```sql
-- Requer extensão unaccent
CREATE EXTENSION IF NOT EXISTS unaccent;

SELECT *
FROM clientes
WHERE unaccent(nome) ILIKE unaccent('%' || $1 || '%')
   OR unaccent(razao_social) ILIKE unaccent('%' || $1 || '%')
   OR unaccent(nome_fantasia) ILIKE unaccent('%' || $1 || '%')
   OR replace(replace(replace(cpf, '.', ''), '-', ''), '/', '') ILIKE '%' || $2 || '%'
   OR replace(replace(replace(cnpj, '.', ''), '-', ''), '/', '') ILIKE '%' || $2 || '%'
ORDER BY nome, razao_social
LIMIT 10;
```

> `$1` = texto original (para busca por nome)  
> `$2` = texto sem máscara (para busca por CPF/CNPJ)

---

## Critérios de Aceite (User Story)

- [ ] O campo de busca retorna resultados por nome, razão social, nome fantasia, CPF ou CNPJ
- [ ] A busca não diferencia maiúsculas de minúsculas
- [ ] A busca não diferencia caracteres acentuados de não acentuados
- [ ] CPF/CNPJ pode ser pesquisado com ou sem máscara
- [ ] Se nenhum cliente for encontrado, exibe o botão "Novo Cliente"
- [ ] O formulário alterna os campos conforme o tipo de pessoa selecionado (PF/PJ)
- [ ] O CEP preenche automaticamente logradouro, bairro, município e UF via ViaCEP
- [ ] CPF e CNPJ são validados antes de salvar
- [ ] Após salvar o novo cliente via modal, ele já fica selecionado no pedido
- [ ] O componente de cadastro pode ser reutilizado em qualquer tela via callback `onSalvar`
- [ ] A tela de clientes permite editar qualquer cliente cadastrado
- [ ] A exclusão só é permitida para clientes sem pedidos vinculados
- [ ] Tentativa de excluir cliente com pedidos exibe mensagem de impedimento
- [ ] A restrição de exclusão é garantida também por chave estrangeira no banco de dados
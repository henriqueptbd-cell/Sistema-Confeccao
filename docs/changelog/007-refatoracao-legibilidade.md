# 007 — Refatoração: legibilidade e boas práticas

**Data:** 2026-04-03  
**Status:** ✅ Concluído

---

## Contexto

O sistema cresceu de forma orgânica — funcionalidades foram sendo adicionadas
conforme a necessidade, sem pausas para reorganizar o código. O resultado é que
alguns arquivos ficaram grandes demais e difíceis de entender por qualquer
programador que não acompanhou o desenvolvimento.

O objetivo desta refatoração é deixar o código limpo, previsível e dentro do
que se espera de boas práticas em projetos React + Node.

---

## Diagnóstico: o estado atual

### Frontend — os problemas reais

| Arquivo | Linhas | Problema |
|---|---|---|
| `Financeiro.jsx` | **1160** | Um único arquivo faz tudo: busca dados, controla estado de 6 abas diferentes, renderiza formulários e tabelas |
| `ModalNovoPedido.jsx` | **585** | Modal com lógica complexa toda misturada num único componente |
| `ModalCliente.jsx` | 207 | Aceitável, mas poderia ser mais simples |

**O problema central do `Financeiro.jsx`:** ele contém 6 módulos completamente
diferentes (Compras, Funcionários, Salários, Custos de Pessoal, Custos Fixos e
Parcelamentos) todos num arquivo só. Cada módulo tem seu próprio estado, seus
próprios formulários e sua própria lógica. Isso viola o princípio de
**responsabilidade única** — cada arquivo deve fazer uma coisa só.

### Backend — está bem organizado

| Arquivo | Linhas | Situação |
|---|---|---|
| `routes/pedidos.js` | 210 | OK |
| `routes/parcelamentos.js` | 204 | OK |
| `routes/custos-fixos.js` | 179 | OK |
| Demais rotas | 50–130 | OK |

O backend já segue o padrão correto: uma rota por arquivo, cada arquivo com
responsabilidade clara. Não precisa de refatoração estrutural.

---

## O que vamos fazer

### 1. Quebrar `Financeiro.jsx` em componentes por aba

Cada aba vira seu próprio arquivo em `client/src/pages/financeiro/`:

```
pages/
  financeiro/
    index.jsx          ← apenas as abas e o carregamento geral
    Compras.jsx        ← tudo sobre compras de material
    Funcionarios.jsx   ← cadastro de funcionários
    Salarios.jsx       ← pagamentos de salário e custos de pessoal
    CustosFixos.jsx    ← tipos e registros de custos fixos
    Parcelamentos.jsx  ← parcelamentos e parcelas
```

Resultado esperado: cada arquivo com ~150–250 linhas, focado num assunto só.

### 2. Extrair lógica de busca para custom hooks

Em vez de misturar `useState` + `useEffect` + chamadas de API dentro dos
componentes, mover essa lógica para hooks reutilizáveis em `client/src/hooks/`:

```js
// Antes — tudo misturado no componente
const [compras, setCompras] = useState([])
useEffect(() => {
  listarCompras(mes, ano).then(setCompras)
}, [mes, ano])

// Depois — lógica isolada num hook
const { compras, recarregar } = useCompras(mes, ano)
```

### 3. Separar formulários complexos do `ModalNovoPedido.jsx`

O modal de novo pedido tem lógica de cálculo de preço, validação e renderização
de múltiplos tipos de peça. Isso pode ser dividido em sub-componentes menores
dentro de `components/novoPedido/`.

---

## O que NÃO vamos mudar

- A estrutura do backend (já está correta)
- A API (`client/src/api/index.js`) — já está bem organizada
- O comportamento visual do sistema — refatoração não muda o que o usuário vê
- Os utilitários em `utils/config.js`

---

## Por que isso importa

Um arquivo de 1160 linhas é difícil de:
- **Ler:** você não consegue entender o arquivo inteiro de uma vez
- **Depurar:** quando algo quebra, é difícil encontrar onde
- **Expandir:** adicionar uma feature nova significa navegar em código não relacionado
- **Revisar:** outro programador levaria muito tempo para entender o que está acontecendo

Após a refatoração, qualquer programador que conhece React consegue abrir
qualquer arquivo e entender o que ele faz em poucos minutos.

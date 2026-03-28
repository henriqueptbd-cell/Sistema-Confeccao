# Catálogo de Produtos — Sistema Confecção

> **Status:** ✅ Catálogo completo — pronto para virar requisito.
> Alterações da última revisão marcadas com 🔄

---

## Estrutura Geral de um Pedido

Cada pedido pode conter **um ou mais produtos**. Para cada produto adicionado:

- **Tipo de produto** — seleção entre: Camiseta, Short, Corta-vento, Bandeira
- **Modelo/detalhes** — varia por tipo de produto (ver seções abaixo)
- **Tamanho** — selecionável diretamente nos grupos (a seleção de tamanho já define a quantidade de peças daquele tamanho)
- **Estampa** — selecionável com campo de observações (ver seção abaixo)
- **Imagens de referência** — campo para anexar uma ou várias imagens; imagens abrem ao clicar no pedido no dashboard

> 🔄 **Campo de quantidade removido** da estrutura geral — a quantidade por tamanho já é definida diretamente na seleção de tamanhos.

### Decisões de interface (UX)

- 🔄 **Botão "Adicionar mais peças"** — deve ficar **no final da lista de peças**, não no topo. Como o formulário de cada peça ficou extenso, o botão no topo ficaria deslocado e confuso. Posicionado no final, o usuário só o vê depois de preencher a peça atual.

---

## Estampa

A estampa usa uma lista selecionável com as seguintes opções:

| Opção | Comportamento |
|---|---|
| **Personalizado** | 🔄 Exibe campo de texto livre para descrever estampa e posicionamento (frente, costas, braços etc.) |
| **Olívia** | 🔄 Exibe campo para escolher cor personalizada |
| **Amaury** | 🔄 Exibe campo para escolher cor personalizada |

> Novos modelos podem ser cadastrados pelo administrador conforme necessário.

---

## 1. Camiseta

### Material
🔄 **Materiais exclusivos da camiseta** — seleção única entre:
- Dry
- Confort UV50
- Crepe
- PV

> ~~Gabardine, Tactel e Tactel Hidrorepelente~~ removidos da camiseta.

### Modelo (corte / manga)
Seleção única entre:
- Manga curta
- Manga longa
- Regata

### Gola
🔄 Seleção única entre:
- Gola redonda
- Gola V
- Polo
- Polo esportiva *(disponível apenas quando o material for **Dry**)*

### Detalhes adicionais — exibição condicional conforme o modelo

| Detalhe | Manga curta | Manga longa | Regata |
|---|---|---|---|
| Punho (com / sem) | 🔄 ❌ | ✅ | ❌ |
| Encaixe de dedão | ❌ | ✅ | ❌ |
| Capuz ou Balaclava | ❌ | ✅ | ❌ |

**Regras:**
- **Punho** — 🔄 aparece somente em **manga longa**
- **Dedão** — aparece somente em **manga longa**
- **Capuz / Balaclava** — aparece somente em **manga longa**, e são **mutuamente exclusivos** (escolha um ou outro):
  - Sem capuz
  - Capuz normal
  - Capuz ninja
  - Balaclava

### Tamanhos
O usuário seleciona diretamente dentro de cada grupo:

| Grupo | Tamanhos |
|---|---|
| Masculino | P, M, G, GG, XG, EXG |
| Feminino (Babylook) | BLP, BLM, BLG, BLGG, BLXG |
| Infantil | 2, 4, 6, 8, 10, 12, 14, 16 |

---

## 2. Short

### Material
- **Fixo: Dry** — não precisa de seleção

### Modelo
Seleção única entre:
- Jet masculino
- Jet feminino
- Futebol

### Detalhes adicionais — checkbox
- **Bolso com zíper:** Sim / Não

### Tamanhos

| Grupo | Tamanhos |
|---|---|
| Masculino / Futebol | P, M, G, GG, XG, EXG |
| Feminino (Babylook) | BLP, BLM, BLG, BLGG, BLXG |
| Infantil | 2, 4, 6, 8, 10, 12, 14, 16 |

---

## 3. Corta-vento

### Material
- **Fixo: Tactel Hidrorepelente** — não precisa de seleção

### Modelo — seleção única
- Com toca
- Sem toca

### Tamanhos
Apenas adulto e infantil — **não tem versão feminina/babylook.**

| Grupo | Tamanhos |
|---|---|
| Adulto | P, M, G, GG, XG, EXG |
| Infantil | 2, 4, 6, 8, 10, 12, 14, 16 |

---

## 4. Bandeira

### Material
Qualquer material disponível — selecionável (mesma lista da camiseta)

### Tamanho
- Campo de texto livre para inserir as medidas (ex: `90cm x 70cm`)
- **Limite máximo:** 90cm x 70cm
- **Faces:** 1 face ou 2 faces — seleção única

### Observações
- Campo aberto de texto livre — o cliente descreve detalhes específicos

---

## Resumo por produto

| Campo | Camiseta | Short | Corta-vento | Bandeira |
|---|---|---|---|---|
| Material | 🔄 Dry / Confort / Crepe / PV | Fixo (Dry) | Fixo (Tactel Hidro.) | Selecionável |
| Modelo | Manga curta / longa / regata | Jet masc. / Jet fem. / Futebol | Com toca / Sem toca | — |
| Gola | 🔄 Redonda / V / Polo / Polo esp. | — | — | — |
| Punho | 🔄 ✅ só manga longa | — | — | — |
| Dedão | ✅ só manga longa | — | — | — |
| Capuz / Balaclava | ✅ só manga longa (mutuamente exclusivos) | — | — | — |
| Bolso c/ zíper | — | ✅ checkbox | — | — |
| Faces | — | — | — | ✅ (1 ou 2) |
| Tamanho adulto masc. | P M G GG XG EXG | P M G GG XG EXG | P M G GG XG EXG | Campo livre |
| Tamanho adulto fem. | BLP BLM BLG BLGG BLXG | BLP BLM BLG BLGG BLXG | ❌ não tem | — |
| Tamanho infantil | 2 ao 16 (pares) | 2 ao 16 (pares) | 2 ao 16 (pares) | — |
| Limite de tamanho | — | — | — | máx. 90×70cm |
| Estampa | 🔄 Personalizado / Olívia / Amaury | 🔄 Personalizado / Olívia / Amaury | 🔄 Personalizado / Olívia / Amaury | 🔄 Personalizado / Olívia / Amaury |
| Imagens | ✅ | ✅ | ✅ | ✅ |
| Observações livres | — | — | — | ✅ |

---

## Resumo das alterações desta revisão

| # | O que mudou |
|---|---|
| 1 | Materiais da camiseta reduzidos para: Dry, Confort UV50, Crepe e PV |
| 2 | Manga curta não tem punho — punho agora é exclusivo de manga longa |
| 3 | Gola ganhou dois tipos novos: Polo e Polo esportiva (Polo esportiva só no material Dry) |
| 4 | Estampa reestruturada: opções Personalizado, Olívia e Amaury — cada uma com comportamento próprio |
| 5 | Campo de quantidade removido — a seleção de tamanhos já define a quantidade por peça |
| 6 | Botão "Adicionar mais peças" movido para o final da lista (UX) | — a seleção de tamanhos já define a quantidade por peça |
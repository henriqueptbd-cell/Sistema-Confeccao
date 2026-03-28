# Modelagem de Banco de Dados

> Banco de dados: **PostgreSQL**  
> Ambiente de desenvolvimento: gerado localmente via script JS  
> Ambiente de produção: a definir (Supabase previsto)

---

## Entidades e Relacionamentos

```
clientes
  └── pedidos (1:N)
        └── pecas (1:N)
              └── pecas_tamanhos (1:N — um registro por tamanho selecionado)
              └── pecas_imagens  (1:N — imagens de referência)
        └── etapas_pedido (1:N — 10 linhas criadas automaticamente por pedido)

usuarios

  └── registrado em etapas_pedido.concluida_por

modelos_estampa
  └── referenciado em pecas
```

### Regras de negócio relevantes ao banco

- Um cliente só pode ser excluído se não tiver pedidos vinculados (`ON DELETE RESTRICT`)
- As 10 etapas são criadas automaticamente ao abrir um pedido via trigger
- As etapas são **simultâneas** — cada uma tem seu próprio status de conclusão
- O pedido é encerrado quando a etapa **"Conferência"** é marcada como concluída
- O número do pedido é um inteiro sequencial a partir de 1, usado para consulta pública sem login
- Clientes não têm conta no sistema — a consulta pública é feita apenas pelo número do pedido
- CPF e CNPJ são salvos sem máscara no banco
- A quantidade de peças por tamanho é definida na tabela `pecas_tamanhos` — não há campo de quantidade na tabela `pecas`
- Polo esportiva só é válida quando o material da camiseta for Dry (regra de negócio no backend)
- Capuz e Balaclava são mutuamente exclusivos — representados por um único enum

---

## DDL — Criação das Tabelas

```sql
-- =============================================
-- EXTENSÕES
-- =============================================

CREATE EXTENSION IF NOT EXISTS unaccent;


-- =============================================
-- TIPOS ENUMERADOS
-- =============================================

CREATE TYPE tipo_pessoa    AS ENUM ('fisica', 'juridica');
CREATE TYPE perfil_usuario AS ENUM ('administrador', 'funcionaria_producao');
CREATE TYPE tipo_produto   AS ENUM ('camiseta', 'short', 'corta_vento', 'bandeira');
CREATE TYPE manga_tipo     AS ENUM ('curta', 'longa', 'regata');
CREATE TYPE gola_tipo      AS ENUM ('redonda', 'v', 'polo', 'polo_esportiva');
CREATE TYPE capuz_tipo     AS ENUM ('sem_capuz', 'capuz_normal', 'capuz_ninja', 'balaclava');
CREATE TYPE short_modelo   AS ENUM ('jet_masculino', 'jet_feminino', 'futebol');
CREATE TYPE material_tipo  AS ENUM ('dry', 'confort_uv50', 'crepe', 'pv', 'tactel_hidrorepelente');
-- tactel_hidrorepelente: fixo para corta-vento
-- dry: fixo para short
-- dry, confort_uv50, crepe, pv: selecionáveis para camiseta e bandeira


-- =============================================
-- CLIENTES
-- =============================================

CREATE TABLE clientes (
  id                 SERIAL PRIMARY KEY,
  tipo_pessoa        tipo_pessoa   NOT NULL,

  -- Pessoa Física
  nome               VARCHAR(255),
  cpf                VARCHAR(11),   -- sem máscara: 11 dígitos

  -- Pessoa Jurídica
  razao_social       VARCHAR(255),
  nome_fantasia      VARCHAR(255),
  cnpj               VARCHAR(14),   -- sem máscara: 14 dígitos
  inscricao_estadual VARCHAR(20),

  -- Comum
  telefone           VARCHAR(20)   NOT NULL,
  email              VARCHAR(255),

  -- Endereço
  cep                VARCHAR(8)    NOT NULL,  -- sem máscara: 8 dígitos
  logradouro         VARCHAR(255)  NOT NULL,
  numero             VARCHAR(20)   NOT NULL,
  complemento        VARCHAR(100),
  bairro             VARCHAR(100)  NOT NULL,
  municipio          VARCHAR(100)  NOT NULL,
  uf                 CHAR(2)       NOT NULL,

  criado_em          TIMESTAMP     DEFAULT NOW(),
  atualizado_em      TIMESTAMP     DEFAULT NOW(),

  CONSTRAINT chk_cliente_pf CHECK (
    tipo_pessoa = 'juridica' OR (nome IS NOT NULL AND cpf IS NOT NULL)
  ),
  CONSTRAINT chk_cliente_pj CHECK (
    tipo_pessoa = 'fisica' OR (razao_social IS NOT NULL AND cnpj IS NOT NULL)
  ),
  CONSTRAINT uq_cpf  UNIQUE (cpf),
  CONSTRAINT uq_cnpj UNIQUE (cnpj)
);


-- =============================================
-- USUÁRIOS
-- =============================================

CREATE TABLE usuarios (
  id           SERIAL PRIMARY KEY,
  nome         VARCHAR(255)   NOT NULL,
  email        VARCHAR(255)   UNIQUE NOT NULL,
  senha_hash   VARCHAR(255)   NOT NULL,
  perfil       perfil_usuario NOT NULL,
  -- Perfis: administrador, funcionaria_producao
  -- Clientes não fazem login — consultam pedidos publicamente pelo número
  ativo        BOOLEAN        DEFAULT TRUE,
  criado_em    TIMESTAMP      DEFAULT NOW()
);


-- =============================================
-- MODELOS DE ESTAMPA
-- =============================================

CREATE TABLE modelos_estampa (
  id    SERIAL PRIMARY KEY,
  nome  VARCHAR(100) NOT NULL,
  ativo BOOLEAN      DEFAULT TRUE
  -- Exemplos iniciais: Personalizado, Olívia, Amaury
  -- Novos modelos cadastrados pelo administrador
);


-- =============================================
-- PEDIDOS
-- =============================================

CREATE TABLE pedidos (
  id            SERIAL PRIMARY KEY,
  numero        INT       UNIQUE NOT NULL,  -- número público de consulta (sem prefixo)
  cliente_id    INT       NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  observacoes   TEXT,
  criado_em     TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Numeração sequencial a partir de 1, cresce indefinidamente (SERIAL suporta até ~2 bilhões)
-- Usado para consulta pública — o cliente informa apenas esse número, sem login
CREATE SEQUENCE pedido_numero_seq START 1;


-- =============================================
-- PEÇAS
-- =============================================

CREATE TABLE pecas (
  id                  SERIAL PRIMARY KEY,
  pedido_id           INT           NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  tipo_produto        tipo_produto  NOT NULL,
  modelo_estampa_id   INT           REFERENCES modelos_estampa(id) ON DELETE SET NULL,
  estampa_descricao   TEXT,         -- preenchido quando estampa = Personalizado
  estampa_cor         VARCHAR(100), -- preenchido quando estampa = Olívia ou Amaury

  -- Camiseta
  material            material_tipo,
  manga               manga_tipo,
  gola                gola_tipo,
  tem_punho           BOOLEAN,      -- só manga longa
  tem_dedao           BOOLEAN,      -- só manga longa
  capuz               capuz_tipo,   -- só manga longa; inclui opção 'balaclava'

  -- Short
  short_modelo        short_modelo,
  tem_bolso_ziper     BOOLEAN,

  -- Corta-vento
  tem_toca            BOOLEAN,

  -- Bandeira
  largura_cm          DECIMAL(5,2),
  altura_cm           DECIMAL(5,2),
  faces               SMALLINT      CHECK (faces IN (1, 2)),

  observacoes         TEXT,         -- campo livre, especialmente para Bandeira
  criado_em           TIMESTAMP     DEFAULT NOW(),

  CONSTRAINT chk_bandeira_dimensoes CHECK (
    tipo_produto != 'bandeira' OR (largura_cm <= 90 AND altura_cm <= 70)
  )
);


-- =============================================
-- TAMANHOS POR PEÇA
-- (quantidade por tamanho — substitui campo quantidade em pecas)
-- =============================================

CREATE TABLE pecas_tamanhos (
  id          SERIAL PRIMARY KEY,
  peca_id     INT          NOT NULL REFERENCES pecas(id) ON DELETE CASCADE,
  tamanho     VARCHAR(10)  NOT NULL,
  -- Valores possíveis:
  -- Adulto masc.:  P, M, G, GG, XG, EXG
  -- Adulto fem.:   BLP, BLM, BLG, BLGG, BLXG
  -- Infantil:      2, 4, 6, 8, 10, 12, 14, 16
  -- Bandeira:      campo livre (ex: "90x70")
  quantidade  INT          NOT NULL DEFAULT 1,
  CONSTRAINT uq_peca_tamanho UNIQUE (peca_id, tamanho)
);


-- =============================================
-- IMAGENS DE REFERÊNCIA POR PEÇA
-- =============================================

CREATE TABLE pecas_imagens (
  id        SERIAL PRIMARY KEY,
  peca_id   INT          NOT NULL REFERENCES pecas(id) ON DELETE CASCADE,
  url       VARCHAR(500) NOT NULL,
  criado_em TIMESTAMP    DEFAULT NOW()
);


-- =============================================
-- ETAPAS DO PEDIDO
-- =============================================

CREATE TABLE etapas_pedido (
  id            SERIAL PRIMARY KEY,
  pedido_id     INT          NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  etapa         VARCHAR(100) NOT NULL,
  ordem         SMALLINT     NOT NULL,
  concluida     BOOLEAN      DEFAULT FALSE,
  concluida_em  TIMESTAMP,
  concluida_por INT          REFERENCES usuarios(id) ON DELETE SET NULL
);
```

---

## Seed — Dados Iniciais

```sql
-- =============================================
-- MODELOS DE ESTAMPA PADRÃO
-- =============================================

INSERT INTO modelos_estampa (nome) VALUES
  ('Personalizado'),
  ('Olívia'),
  ('Amaury');
```

### Função + Trigger: criar etapas ao abrir pedido

```sql
CREATE OR REPLACE FUNCTION criar_etapas_pedido()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO etapas_pedido (pedido_id, etapa, ordem) VALUES
    (NEW.id, 'Entrada do pedido',           1),
    (NEW.id, 'Montagem da estampa',         2),
    (NEW.id, 'Impressão',                   3),
    (NEW.id, 'Corte',                       4),
    (NEW.id, 'Estampa',                     5),
    (NEW.id, 'Triagem para costura',        6),
    (NEW.id, 'Costura',                     7),
    (NEW.id, 'Arremate',                    8),
    (NEW.id, 'Conferência',                 9),
    (NEW.id, 'Pedido pronto para retirada', 10);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_criar_etapas
AFTER INSERT ON pedidos
FOR EACH ROW EXECUTE FUNCTION criar_etapas_pedido();
```

---

## Queries de Referência

### Busca de clientes (unificada)

```sql
-- $1 = texto original | $2 = texto sem máscara (. - /)
SELECT *
FROM clientes
WHERE unaccent(nome)          ILIKE unaccent('%' || $1 || '%')
   OR unaccent(razao_social)  ILIKE unaccent('%' || $1 || '%')
   OR unaccent(nome_fantasia) ILIKE unaccent('%' || $1 || '%')
   OR cpf  ILIKE '%' || $2 || '%'
   OR cnpj ILIKE '%' || $2 || '%'
ORDER BY COALESCE(nome, razao_social)
LIMIT 10;
```

### Status das etapas de um pedido

```sql
SELECT etapa, ordem, concluida, concluida_em
FROM etapas_pedido
WHERE pedido_id = $1
ORDER BY ordem;
```

### Verificar se pedido pode ser encerrado

```sql
-- Pedido encerra quando "Conferência" está concluída
SELECT concluida
FROM etapas_pedido
WHERE pedido_id = $1
  AND etapa = 'Conferência';
```

### Peças de um pedido com tamanhos e quantidades

```sql
SELECT
  p.id,
  p.tipo_produto,
  p.manga,
  p.material,
  pt.tamanho,
  pt.quantidade
FROM pecas p
JOIN pecas_tamanhos pt ON pt.peca_id = p.id
WHERE p.pedido_id = $1
ORDER BY p.id, pt.tamanho;
```
/**
 * Script de migração: cria as tabelas para o módulo de custos parcelados (Fase 3).
 * Uso: node scripts/criar-tabelas-parcelamentos.js
 */

require('dotenv').config({ quiet: true });
const pool = require('../src/db');

async function criar() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS parcelamentos (
      id              SERIAL PRIMARY KEY,
      descricao       VARCHAR(255)  NOT NULL,
      valor_total     DECIMAL(10,2) NOT NULL,
      num_parcelas    SMALLINT      NOT NULL CHECK (num_parcelas > 0),
      valor_parcela   DECIMAL(10,2) NOT NULL,
      data_primeira   DATE          NOT NULL,
      observacoes     TEXT,
      ativo           BOOLEAN       DEFAULT TRUE,
      criado_em       TIMESTAMP     DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS parcelas (
      id              SERIAL PRIMARY KEY,
      parcelamento_id INT           NOT NULL REFERENCES parcelamentos(id) ON DELETE CASCADE,
      numero          SMALLINT      NOT NULL,
      valor           DECIMAL(10,2) NOT NULL,
      data_prevista   DATE          NOT NULL,
      data_pagamento  DATE,
      valor_pago      DECIMAL(10,2),
      observacoes     TEXT,
      criado_em       TIMESTAMP     DEFAULT NOW(),
      CONSTRAINT uq_parcela_num UNIQUE (parcelamento_id, numero)
    )
  `);

  console.log('Tabelas parcelamentos e parcelas criadas (ou já existiam).');
  await pool.end();
}

criar().catch(e => { console.error(e); process.exit(1); });

/**
 * Script de migração: cria as tabelas para o módulo de custos fixos (Fase 2).
 * Uso: node scripts/criar-tabelas-custos-fixos.js
 */

require('dotenv').config({ quiet: true });
const pool = require('../src/db');

async function criar() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS custos_fixos_tipos (
      id        SERIAL PRIMARY KEY,
      nome      VARCHAR(100) NOT NULL,
      categoria VARCHAR(50) NOT NULL,
      dia_venc  SMALLINT,
      ativo     BOOLEAN DEFAULT TRUE,
      criado_em TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS custos_fixos_registros (
      id            SERIAL PRIMARY KEY,
      tipo_id       INT NOT NULL REFERENCES custos_fixos_tipos(id),
      mes           SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
      ano           SMALLINT NOT NULL,
      valor_pago    DECIMAL(10,2),
      data_pagamento DATE,
      observacoes   TEXT,
      criado_em     TIMESTAMP DEFAULT NOW(),
      CONSTRAINT uq_custo_fixo_mes UNIQUE (tipo_id, mes, ano)
    )
  `);

  console.log('Tabelas custos_fixos_tipos e custos_fixos_registros criadas (ou já existiam).');
  await pool.end();
}

criar().catch(e => { console.error(e); process.exit(1); });
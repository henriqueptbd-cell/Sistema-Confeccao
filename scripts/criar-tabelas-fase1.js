/**
 * Script de migração: cria as tabelas para salários e custos adicionais de pessoal (Fase 1).
 * Uso: node scripts/criar-tabelas-fase1.js
 */

require('dotenv').config({ quiet: true });
const pool = require('../src/db');

async function criar() {
  // Pagamentos mensais de salário
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pagamentos_salario (
      id              SERIAL PRIMARY KEY,
      funcionario_id  INT           NOT NULL REFERENCES funcionarios(id),
      mes             SMALLINT      NOT NULL CHECK (mes BETWEEN 1 AND 12),
      ano             SMALLINT      NOT NULL,
      data_pagamento  DATE          NOT NULL,
      valor_pago      DECIMAL(10,2) NOT NULL,
      observacoes     TEXT,
      criado_em       TIMESTAMP     DEFAULT NOW(),
      CONSTRAINT uq_pagamento_mes UNIQUE (funcionario_id, mes, ano)
    )
  `);

  // Custos extras de pessoal (vinculados a uma funcionária específica)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS custos_adicionais_pessoal (
      id             SERIAL PRIMARY KEY,
      funcionario_id INT           NOT NULL REFERENCES funcionarios(id),
      data           DATE          NOT NULL,
      descricao      VARCHAR(255)  NOT NULL,
      valor          DECIMAL(10,2) NOT NULL,
      criado_em      TIMESTAMP     DEFAULT NOW()
    )
  `);

  console.log('Tabelas pagamentos_salario e custos_adicionais_pessoal criadas (ou já existiam).');
  await pool.end();
}

criar().catch(e => { console.error(e); process.exit(1); });
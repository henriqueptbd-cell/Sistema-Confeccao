/**
 * Script de migração: cria a tabela de auditoria para conformidade LGPD.
 * Rodar UMA VEZ antes de subir a Fase 6 em produção.
 * Uso: node scripts/criar-tabela-auditoria.js
 */

require('dotenv').config({ quiet: true });
const pool = require('../src/db');

async function criar() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auditoria (
      id            SERIAL PRIMARY KEY,
      usuario_id    INTEGER,
      usuario_nome  VARCHAR(255),
      acao          VARCHAR(100) NOT NULL,
      alvo_tipo     VARCHAR(50),
      alvo_id       INTEGER,
      ip            VARCHAR(45),
      criado_em     TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('Tabela auditoria criada (ou já existia).');
  await pool.end();
}

criar().catch(e => { console.error(e); process.exit(1); });

/**
 * Migração: adicionar colunas de pagamento na tabela compras
 * Executar uma única vez no banco de produção.
 *
 * Uso: node docs/scripts-migracao/compras-forma-pagamento.js
 */

require('dotenv').config()
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

async function run() {
  const client = await pool.connect()
  try {
    await client.query(`
      ALTER TABLE compras
        ADD COLUMN IF NOT EXISTS forma_pagamento  VARCHAR(20) NOT NULL DEFAULT 'a_vista'
          CHECK (forma_pagamento IN ('a_vista', 'faturado')),
        ADD COLUMN IF NOT EXISTS data_vencimento  DATE,
        ADD COLUMN IF NOT EXISTS data_pagamento   DATE
    `)
    console.log('✅ Colunas adicionadas com sucesso.')
  } finally {
    client.release()
    await pool.end()
  }
}

run().catch(e => { console.error('❌ Erro:', e.message); process.exit(1) })

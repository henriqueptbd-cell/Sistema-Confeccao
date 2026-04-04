/**
 * Script de migração única: hasheia senhas em texto puro existentes no banco.
 * Rodar UMA VEZ antes de subir a Fase 2 em produção.
 * Uso: node scripts/migrar-senhas.js
 */

require('dotenv').config({ quiet: true });
const pool   = require('../src/db');
const bcrypt = require('bcrypt');

async function migrar() {
  const { rows } = await pool.query('SELECT id, email, senha FROM usuarios');

  let migrados = 0;
  for (const u of rows) {
    // Hashes bcrypt sempre começam com $2b$ — pula quem já foi migrado
    if (u.senha.startsWith('$2b$') || u.senha.startsWith('$2a$')) {
      console.log(`  [ok]  ${u.email} — já hasheado, pulando`);
      continue;
    }
    const hash = await bcrypt.hash(u.senha, 12);
    await pool.query('UPDATE usuarios SET senha = $1 WHERE id = $2', [hash, u.id]);
    console.log(`  [✓]   ${u.email} — migrado`);
    migrados++;
  }

  console.log(`\nConcluído. ${migrados} senha(s) migrada(s).`);
  await pool.end();
}

migrar().catch(e => { console.error(e); process.exit(1); });

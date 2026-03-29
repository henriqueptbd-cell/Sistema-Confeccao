// Utilitário de banco de dados (JSON file)
// Em produção no Vercel, o filesystem é read-only exceto /tmp.
// O db.json original é copiado para /tmp na primeira leitura e
// todas as escritas vão para /tmp também (persiste durante a sessão).

const fs   = require('fs');
const path = require('path');

const SOURCE_PATH = path.resolve(__dirname, '../data/db.json');
const TMP_PATH    = '/tmp/db.json';
const IS_VERCEL   = !!process.env.VERCEL;

function lerDb() {
  if (IS_VERCEL) {
    if (!fs.existsSync(TMP_PATH)) {
      fs.copyFileSync(SOURCE_PATH, TMP_PATH);
    }
    return JSON.parse(fs.readFileSync(TMP_PATH, 'utf-8'));
  }
  return JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf-8'));
}

function salvarDb(db) {
  const dest = IS_VERCEL ? TMP_PATH : SOURCE_PATH;
  fs.writeFileSync(dest, JSON.stringify(db, null, 2), 'utf-8');
}

module.exports = { lerDb, salvarDb };

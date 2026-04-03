const pool = require('./db');

/**
 * Registra uma ação na trilha de auditoria.
 * Fire-and-forget: não bloqueia a resposta, falha silenciosamente no log.
 *
 * @param {object} req        - Request do Express (para pegar usuário e IP)
 * @param {string} acao       - Ex: 'listar_clientes', 'excluir_cliente'
 * @param {string} alvoTipo   - Ex: 'cliente', 'usuario'
 * @param {number} alvoId     - ID do registro afetado (null para listagens)
 */
function registrar(req, acao, alvoTipo = null, alvoId = null) {
  const u  = req.usuario || {};
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip;

  pool.query(
    `INSERT INTO auditoria (usuario_id, usuario_nome, acao, alvo_tipo, alvo_id, ip)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [u.id || null, u.nome || null, acao, alvoTipo, alvoId || null, ip]
  ).catch(e => console.error('[auditoria] falha ao registrar:', e.message));
}

module.exports = { registrar };

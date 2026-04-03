const jwt = require('jsonwebtoken');

// Rotas que não exigem autenticação
const ROTAS_PUBLICAS = [
  { method: 'POST', regex: /^\/api\/auth\/login$/ },
  { method: 'GET',  regex: /^\/api\/pedidos\/\d+$/ }, // consulta pública do cliente
];

module.exports = function authMiddleware(req, res, next) {
  const isPublica = ROTAS_PUBLICAS.some(
    r => r.method === req.method && r.regex.test(req.path)
  );
  if (isPublica) return next();

  // Ignorar rotas que não são da API
  if (!req.path.startsWith('/api/')) return next();

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ mensagem: 'Não autorizado.' });
  }

  try {
    const token = header.slice(7);
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
  }
};

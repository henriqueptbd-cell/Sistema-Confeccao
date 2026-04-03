const express = require('express');
const dotenv  = require('dotenv');
const path    = require('path');
const cors    = require('cors');

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3004'] }));
app.use(require('helmet')({ contentSecurityPolicy: false }));
app.use(express.json());

// Rotas públicas ANTES do middleware de auth
app.use('/api/auth', require('./routes/auth'));

// Middleware de auth para todas as outras rotas
app.use(require('./middleware/auth'));

app.use('/api/pedidos',     require('./routes/pedidos'));
app.use('/api/clientes',    require('./routes/clientes'));
app.use('/api/config',      require('./routes/config'));
app.use('/api/funcionarios', require('./routes/funcionarios'));
app.use('/api/compras',     require('./routes/compras'));
app.use('/api/usuarios',    require('./routes/usuarios'));
app.use('/api/pagamentos-salario', require('./routes/pagamentos-salario'));
app.use('/api/custos-pessoal', require('./routes/custos-pessoal'));
app.use('/api/custos-fixos', require('./routes/custos-fixos'));
app.use('/api/parcelamentos', require('./routes/parcelamentos'));


// Serve static files from the 'dist' directory (Vite build output)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// API 404 handler: rotas /api não encontradas devem responder JSON
app.use('/api', (req, res) => {
  res.status(404).json({ mensagem: 'Rota API não encontrada.' });
});

// Catch-all route to serve the frontend index.html for qualquer outra rota
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;

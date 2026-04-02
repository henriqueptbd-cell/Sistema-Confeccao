const express = require('express');
const dotenv  = require('dotenv');
const path    = require('path');

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/pedidos',     require('./routes/pedidos'));
app.use('/api/clientes',    require('./routes/clientes'));
app.use('/api/config',      require('./routes/config'));
app.use('/api/funcionarios', require('./routes/funcionarios'));
app.use('/api/compras',     require('./routes/compras'));
app.use('/api/usuarios',    require('./routes/usuarios'));

// Serve static files from the 'dist' directory (Vite build output)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Catch-all route to serve the frontend index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ quiet: true, path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3004;

const publicPath = path.resolve(__dirname, '../public');

app.use(express.json());
app.use(express.static(path.join(publicPath, 'assets')));
app.use(express.static(path.join(publicPath, 'pages')));
app.use(express.static(publicPath));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/config',  require('./routes/config'));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'pages', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;

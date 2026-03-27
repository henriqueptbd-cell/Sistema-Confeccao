const express = require('express');
const dotenv = require('dotenv');
const path = require('path');


dotenv.config({
    quiet: true,
    path: path.resolve(__dirname, '../.env')
});


const publicPath = path.resolve(__dirname, '../public');
const assetsPath = path.resolve(publicPath, 'assets');
const pagesPath = path.resolve(publicPath, 'pages');

const app = express();
const PORT = process.env.PORT;


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
});

app.use(express.static(publicPath));
app.use(express.static(assetsPath));
app.use(express.static(pagesPath));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(pagesPath, 'index.html'));
});

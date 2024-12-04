const express = require('express');
const next = require('next');
const path = require('path');

// Identificar o ambiente atual
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();



app.prepare().then(() => {
  const server = express();

  // Log do ambiente para facilitar debug
  console.log(`Servidor rodando no modo ${process.env.NODE_ENV.toUpperCase()}`);

  // Configura o diretório de uploads para servir arquivos estáticos
  server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Exemplo de rota de teste em desenvolvimento
  if (dev) {
    server.get('/test', (req, res) => {
      res.send('Rota de teste no ambiente de desenvolvimento!');
    });
  }

  // Rota padrão para o Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Porta dinâmica baseada no ambiente
  const port = process.env.PORT || 8080;
  server.listen(port, '127.0.0.1', (err) => {
    if (err) throw err;
    console.log(`> Servidor pronto em http://127.0.0.1:${port}`);
  });
});

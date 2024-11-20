const express = require('express');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Configura o diretório de uploads para servir arquivos estáticos
  server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Rota padrão para o Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;  // Pode ser 80 ou 443 dependendo do proxy
  server.listen(port, '0.0.0.0', (err) => {  // Listen em 0.0.0.0
    if (err) throw err;
    console.log(`> Ready on http://0.0.0.0:${port}`);
  });
});

#!/bin/bash

# Navegar para o diretório do projeto
cd D:/projetos/nextjs-dashboard

# Instalar dependências
npm install

# Limpar a pasta .next para garantir que nenhum cache de build esteja sendo usado
rm -rf .next

# Criar a build de produção
npm run build

# Parar todas as instâncias anteriores do aplicativo
pm2 stop corpusfit || true

# Remover todas as instâncias anteriores do aplicativo
pm2 delete corpusfit || true

# Remover caches do PM2
pm2 flush

# Iniciar a aplicação com PM2
pm2 start npm --name "corpusfit" -- start

# Salvar a configuração atual do PM2
pm2 save

# Reiniciar o Nginx para garantir que as alterações de cache estão em vigor (se aplicável)
sudo service nginx restart

# Verificar os logs do PM2 para garantir que a aplicação está funcionando corretamente
# pm2 logs corpusfit

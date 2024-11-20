module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001', // Porta onde o servidor está rodando
        pathname: '/uploads/**', // Caminho específico para suas imagens
      },
    ],
  },
  basePath: '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/assets' : '',
};

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'corpusfit.site',  // Seu domínio real
        port: '', // Não especificar porta se estiver usando a porta padrão 80
        pathname: '/uploads/**',
      },
    ],
  },
  basePath: '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/assets' : '',
};

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Adicione os links de fontes para o Google Fonts aqui */}
        <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Lato:wght@400;700&display=swap"
        rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

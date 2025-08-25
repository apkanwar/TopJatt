import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="Shortcut Icon" href="icon.png" />        
      </Head>
      <body className="bg-top-orange">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

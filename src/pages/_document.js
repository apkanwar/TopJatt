import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="Shortcut Icon" href="favicon.ico" />        
      </Head>
      <body className="bg-top-orange">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

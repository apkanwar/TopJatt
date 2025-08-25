import Footer from '@/components/footer'
import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { DefaultSeo } from 'next-seo'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <main>
      <DefaultSeo
        openGraph={{
          type: 'website',
          locale: 'en',
          siteName: 'TopJatt'
        }}
      />
      <SessionProvider session={session}>
        <Component {...pageProps} />
        <Footer />
      </SessionProvider>
    </main>
  )
}
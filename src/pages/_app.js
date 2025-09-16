import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { NextSeo } from 'next-seo'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <main>
      <NextSeo
        title="TopJatt"
        description='An inside view of the mind of a pro trader!'
        canonical='https://www.topjatt.com/'
        openGraph={{
          url: 'https://www.topjatt.xyz/',
          title:
            "TopJatt - Home",
          description:
            'An inside view of the mind of a pro trader!',
          images: [
            {
              url: '/icon.png',
              width: 500,
              height: 500,
              alt: 'TopJatt Logo',
              type: 'image/png'
            }
          ],
          siteName: 'TopJatt'
        }}
      />
      <SessionProvider session={session}>
        <Component {...pageProps} />

      </SessionProvider>
    </main>
  )
}
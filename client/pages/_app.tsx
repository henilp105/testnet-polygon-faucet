import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ToastContainer } from 'react-toastify'
import ThemeSwitch from '../components/ThemeSwitch'
import Head from 'next/head'
import GithubCorner from '../components/GithubCorner'
import PolygonScan from '../components/PolygonScan'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" />
        <meta
          name="description"
          content="Polygon Matic community run faucet."
        />
        <meta
          name="keywords"
          content="matic, faucet, polygon network, ad free, free matic, crypto, ethereum, polygon matic"
        />
        <meta name="robots" content="index, follow" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content="English" />
        <meta name="author" content="Henil Panchal" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Polygon Matic Community Faucet" />
        <meta
          property="og:description"
          content="Polygon Matic community run faucet"
        />
        <meta property="og:image" content="/banner.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:title"
          content="Polygon Matic Community Faucet"
        />
        <meta
          property="twitter:description"
          content="Polygon Matic community run faucet."
        />
        <meta property="twitter:image" content="/banner.png" />
      </Head>
      <GithubCorner repository={'https://github.com/henilp105/polygon-faucet'} />
     
      <ToastContainer hideProgressBar={true} />
      <main
        className={`flex min-h-screen flex-col items-center justify-center bg-white py-2 dark:bg-slate-900 dark:text-white`}
      >
        <Component {...pageProps} />
      </main>

      <footer
        className={`fixed bottom-2 left-0 flex w-full flex-col items-center justify-center space-y-2 text-xs text-gray-500`}
      >
        <div>
          Made with ♡ by
          <a className="ml-1 text-purple-600 dark:text-lime-400" href ="https://github.com/henilp105/polygon-faucet">Henil Panchal</a>
          
        </div>
        <p className="flex">
          <span className="mr-1">Developer donations ♥</span>
          <PolygonScan address={'0x7a55f1544d7387E97596F8ebe604a0BfB9b33f37'} />
        </p>
      </footer>
    </>
  )
}

export default MyApp

import Script from 'next/script';
import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

const App = ({ Component, pageProps }: AppProps) => {
  const gtag = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <>
      {gtag && 
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtag}`} />
          <Script id="google-analytics">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', '${gtag}');
            `}
          </Script>
        </>
      }
      <Component {...pageProps} />
    </>
  );
}

export default App;
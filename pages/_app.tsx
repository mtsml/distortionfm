import { useEffect } from "react";
import Script from "next/script";
import type { AppProps } from "next/app";
import { config, library } from "@fortawesome/fontawesome-svg-core";
import { faM, faH, faG } from '@fortawesome/free-solid-svg-icons'
import "@fortawesome/fontawesome-svg-core/styles.css";
import { regsterServiceWorkerOrThowError } from "@/util/utility";
import "@/styles/globals.css";

// FontAwesome Settings
config.autoAddCss = false;
library.add(faM, faH, faG);

const App = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    try {
      regsterServiceWorkerOrThowError()
    } catch (error) {
      // マウント時はエラーメッセージを表示しない
    }
  }, []);

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
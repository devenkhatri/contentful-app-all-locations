import { GlobalStyles } from '@contentful/f36-components';
import { SDKProvider } from '@contentful/react-apps-toolkit';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic'

function App({ Component, pageProps }: AppProps) {
  const isLocal = (typeof window !== "undefined") && (window.self === window.top);
  const LocalhostWarningNoSSR = dynamic(() => import('@/components/LocalhostWarning'), { ssr: false })
  return (
    isLocal 
      ? <LocalhostWarningNoSSR/> 
      : <SDKProvider>
          <GlobalStyles />
          <Component {...pageProps} />
        </SDKProvider>
  );
}

export default App;

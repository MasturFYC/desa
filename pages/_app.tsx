import Head from "next/head";
import type { AppProps } from "next/app";
import { Fragment } from "react";
import { SWRConfig } from "swr";
import { SSRProvider } from "@react-aria/ssr";
import { Provider } from '@react-spectrum/provider'
import { theme as defaultTheme } from "@react-spectrum/theme-default";
import { I18nProvider } from '@react-aria/i18n';
import fetchJson from "@lib/fetchJson";

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <Fragment>
      <Head>
        <title>Next App</title>
        <link href="/favicon.ico" rel="icon" />
        <meta
          content="minimum-scale=1, initial-scale=1, width=device-width"
          name="viewport"
        />
      </Head>
      <SSRProvider>
        <Provider theme={defaultTheme}
          colorScheme="light">
          {/*  locale={locale}> */}
          <SWRConfig
            value={{
              fetcher: fetchJson,
              onError: (err) => {
                console.error(err);
              },
            }}
          >
            <I18nProvider locale="id-ID">
              <Component {...pageProps} />
            </I18nProvider>
          </SWRConfig>
        </Provider>
      </SSRProvider>
    </Fragment>
  );
}

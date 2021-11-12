import Head from "next/head";
import type { AppProps } from "next/app";
import * as React from "react";
import { SWRConfig } from "swr";
import { SSRProvider, Provider, defaultTheme } from "@adobe/react-spectrum";
import fetchJson from "@lib/fetch-json";

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  return (
    <React.Fragment>
      <Head>
        <title>Next App</title>
        <link href="/favicon.ico" rel="icon" />
        <meta
          content="minimum-scale=1, initial-scale=1, width=device-width"
          name="viewport"
        />
      </Head>
      <SSRProvider>
        <Provider theme={defaultTheme}>
          {/*  locale={locale}> */}
          <SWRConfig
            value={{
              fetcher: fetchJson,
              onError: (err) => {
                console.error(err);
              },
            }}
          >
            <Component {...pageProps} />
          </SWRConfig>
        </Provider>
      </SSRProvider>
    </React.Fragment>
  );
}

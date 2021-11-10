import Head from 'next/head';
import type { AppProps } from 'next/app';
import * as React from 'react';
import { SWRConfig } from 'swr'
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@src/theme';
import fetchJson from '@lib/fetch-json'

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  return (
    <React.Fragment>
      <Head>
        <title>Next App</title>
        <link href="/favicon.ico" rel="icon" />
        <meta content="minimum-scale=1, initial-scale=1, width=device-width" name="viewport" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SWRConfig
          value={{
            fetcher: fetchJson,
            onError: (err) => {
              console.error(err)
            },
          }}
        >
        <Component {...pageProps} />
        </SWRConfig>
      </ThemeProvider>
    </React.Fragment>
  );
}

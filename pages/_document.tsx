import Document, { Html, Head, Main, NextScript } from 'next/document';

// https://mui.com/styles/advanced/#next-js
export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
        </Head>
        <body style={{margin: 0, padding: 0}}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

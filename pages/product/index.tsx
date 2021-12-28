import dynamic from 'next/dynamic';
import { withIronSessionSsr } from "iron-session/next";
import { ironOptions } from '@lib/config';
import { iUserLogin } from '@components/interfaces';
import Router from 'next/router';
const ProductComponent = dynamic(() => import('@components/product'), { ssr: false });

export default function Index() {
  return <ProductComponent />;
}

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req, res }) {
    const user = req.session.user;
    
    if (!user) {
      console.log('NON-USER')
        res.writeHead(301, { // or 302
          Location: process.env.apiKey + "/",
        });
        res.end();
    }

    return {
      props: {
        user: req.session.user || null,
      },
    };
  },
  ironOptions
);

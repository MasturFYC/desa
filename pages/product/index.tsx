import dynamic from 'next/dynamic';
import useUser from '@lib/useUser';

const ProductComponent = dynamic(() => import('@components/product'), { ssr: false });

export default function Index() {
  return <ProductComponent />;
}

// export const getServerSideProps = withIronSessionSsr(

//   async function GetServerSideProps({ req }) {
//     const user = req.session.user;

//     if (user?.admin !== true) {
//       return {
//         redirect: {          
//           destination: "/login",
//           permanent: false,
//         },
//         // notFound: true,
//       };
//     }

//     return {
//       props: { user },
//     };
//   }, ironOptions);

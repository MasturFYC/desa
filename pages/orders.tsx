import dynamic from 'next/dynamic';

const OrderComponent =dynamic(()=>import('@components/orders'), {
  ssr: false
});

export default function Index() {
  return <OrderComponent />;
}

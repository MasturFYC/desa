import dynamic from 'next/dynamic';
const StockComponent = dynamic(()=> import('@components/stock'), {ssr:false});

export default function Index() {
  return <StockComponent />;
}

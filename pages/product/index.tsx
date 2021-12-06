import dynamic from 'next/dynamic';
const ProductComponent = dynamic(() =>import('@components/product'), {ssr:false});

export default function Index() {
  return <ProductComponent />;
}

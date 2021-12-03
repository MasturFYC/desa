import dynamic from 'next/dynamic';
const SpecialOrderComponent=dynamic(()=>import('@components/special-order'),{ssr:false});

export default function Index() {
  return <SpecialOrderComponent />;
}

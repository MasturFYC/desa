import dynamic from 'next/dynamic';
const SupplierDetailComponent = dynamic(() => import('@components/supplier-detail'),
{
  ssr: false
});

export default function Index() {
  return <SupplierDetailComponent />;
}

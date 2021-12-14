import dynamic from 'next/dynamic';

const ReportComponent =dynamic(()=>import('@components/report'), {
  ssr: false
});

export default function Index() {
  return <ReportComponent />;
}

import dynamic from "next/dynamic";
//import CustomerComponent from '@components/customer';

const CustomerComponent = dynamic(() => import("@components/customer"), {
  ssr: false,
});


export default function Index() {
  return <CustomerComponent />;
}

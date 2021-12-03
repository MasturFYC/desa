
import dynamic from "next/dynamic";

const CustomerDetailComponent = dynamic(() => import("@components/customer-detail"), {
  ssr: false,
});

export default function Index() {
  return <CustomerDetailComponent />;
}

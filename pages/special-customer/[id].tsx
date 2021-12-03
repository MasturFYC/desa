
import dynamic from "next/dynamic";

const SpecialCustomerComponent = dynamic(() => import("@components/special-customer"), {
  ssr: false,
});

export default function Index() {
  return <SpecialCustomerComponent />;
}

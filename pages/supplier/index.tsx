import dynamic from "next/dynamic";
const SupplierComponent = dynamic(() => import("@components/supplier"), {
  ssr: false,
});

export default function Index() {
  return <SupplierComponent />;
}

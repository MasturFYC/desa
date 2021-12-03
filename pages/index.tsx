import dynamic from "next/dynamic";
import { View } from "@react-spectrum/view";
const Layout = dynamic(()=> import("@components/layout"), {ssr: false});

export default function Index() {
  return (
    <Layout home>
      <View>Index</View>
    </Layout>
  );
}

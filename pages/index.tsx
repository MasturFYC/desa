import dynamic from "next/dynamic";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
const Layout = dynamic(() => import("@components/layout-2"), { ssr: false });
const Logo = dynamic(() => import("@components/logo"), { ssr: false });

export default function Index() {
  return (
    <Layout home>
      <View>
        <ShowFirstPage />
      </View>
    </Layout>
  );
}

function ShowFirstPage() {
  return (
    <Flex direction={"column"} alignItems={"center"} justifyContent={"center"} maxWidth={640}>
      <Logo width={50} />
      <div className="sip">SUMBER IKAN PUTRI</div>
      <style jsx>{`
        .sip {
          display: block;
          margin-top: 24px;
          font-size: 32px;
          font-weight: 700;
          text-align: center;
          letter-spacing: 6px;
          color: #999;
        }`}</style>
    </Flex>
  )
}

import { NextPage } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { iUserLogin } from "@components/interfaces";
import { Grid } from "@react-spectrum/layout";
import { View } from "@react-spectrum/view";
import MainMenu from "./main-menu";
import { Flex } from "@react-spectrum/layout";
import { Footer } from "@react-spectrum/view";
export const siteTitle = "SPBU";

const Logo = dynamic(()=> import("./logo"),{ssr:false});

type LayoutProps = {
  activeMenu?: string;
  children: React.ReactNode;
  home?: boolean;
  user?: iUserLogin;
  mutateUser?: (
    data?: any,
    shouldRevalidate?: boolean | undefined
  ) => Promise<any>;
};

const Layout: NextPage<LayoutProps> = ({
  children,
  home,
  user,
  mutateUser,
  activeMenu,
}) => {
  const router = useRouter();

  return (
    <Grid
      areas={{
        base: ["header header", "content content", "footer footer"],
        M: ["header  header", "sidebar content", "footer  footer"],
        L: ["header  header", "sidebar content", "footer  footer"],
      }}
      columns={["1fr", "3fr"]}
      rows={["size-1200", "auto", "size-1000"]}
      minHeight={"100vh"}
    >
      <View
        gridArea="header"
        backgroundColor="gray-50"
        paddingTop={"size-50"}
        borderBottomWidth={"thin"}
        borderBottomColor={"gray-200"}
        paddingX={{ base: "size-100", M: "size-200" }}
      >
        <Flex direction={"row"} columnGap={"size-200"} alignItems={"center"}>
          <View width={"100px"}>
            {home
              ? <Logo width={96} />
              : <Link href={'/'} passHref>
                <a><Logo width={96} /></a>
              </Link>
            }
          </View>
          <View flex>
            <View>
              {home
                ? <div style={{ 
                  fontSize: "24px", 
                  fontWeight: 700,
                  color: "Highlight" }}
                  >
                    Sumber Ikan Putri
                  </div>
                : <Link href={'/'} passHref>
                  <a style={{ 
                    fontSize: "24px", 
                    fontWeight: 700, 
                    textDecoration: 'none', 
                    color: "Highlight" 
                  }}
                  >
                    Sumber Ikan Putri
                  </a>
                </Link>
              }
            </View>
          </View>
        </Flex>
      </View>
      <View
        //borderWidth={"thin"}
        gridArea="sidebar"
        isHidden={{ base: true, M: false, L: false }}
        backgroundColor={"gray-50"}
        //width={"size-3000"}
        padding={"size-100"}
      >
        <MainMenu activeMenu={home ? "Home" : activeMenu} />
      </View>

      <View gridArea="content" backgroundColor="gray-50" height={"100%"}>
        <View paddingX={{ base: "size-75", M: "size-200", L: "size-400" }} marginTop={"size-200"}>
          {home ? <ShowFirstPage /> : children}
        </View>
      </View>

      <Footer gridArea="footer" flex>
        <View
          flex
          paddingTop={"size-100"}
          paddingX={{ base: "size-75", M: "size-400" }}
        >
          &copy; FYC 2021. All rights reserved.
        </View>
      </Footer>
    </Grid>
  );
};

function ShowFirstPage(){
  return (
    <Flex direction={"column"} alignItems={"center"} justifyContent={"center"}>
      <Logo width={512} />
      <span>SUMBER IKAN PUTRI</span>
      <style jsx>{`
        span {
          margin-top: 24px;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 6px;
          color: #999;
        }`}</style>
    </Flex>
  )
}
export default Layout;

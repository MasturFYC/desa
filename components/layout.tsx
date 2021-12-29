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
import useUser from "@lib/useUser";
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
  activeMenu,
}) => {
  const { user, mutateUser } = useUser({
    redirectTo: '/login',
    redirectIfFound: false
  })



  let titleStyle = {
    fontSize: "120%",
    fontWeight: 700,
    lineHeight: "90%",
    textDecoration: 'none',
    color: "Highlight"
  };

  return (
    <Grid
      areas={{
        base: ["header sidebar", "content content", "footer footer"],
        M: ["header  sidebar", "content content", "footer  footer"],
        L: ["header  header", "sidebar content", "footer  footer"],
      }}
      columns={["1fr", "3fr"]}
      rows={["size-1250", "auto", "size-1000"]}
      minHeight={"100vh"}
    >
      <View
        gridArea="header"
        borderBottomWidth={"thin"}
        borderBottomColor={"gray-200"}
        paddingX={{ base: "size-50", M: "size-200" }}
        backgroundColor={"gray-50"}
      >
        <Flex flex direction={"row"} columnGap={{ base: "size-10", M: "size-50" }}>
          <View width={{ base: 64, M: 90 }} alignSelf={"center"}
          flex={{base: 1, M: 1, L:"none"}} marginTop={{base: "size-10", L:"size-25"}}>
            {home
              ? <Logo width={100} />
              : <Link href={'/'} passHref>
                <a><Logo width={100} /></a>
              </Link>
            }
          </View>
          <View flex isHidden={{base: true,L:false}} alignSelf={"center"}>
            <View>
              {home
                ? <div style={titleStyle}
                  >
                    Sumber Ikan Putri
                  </div>
                : <Link href={'/'} passHref>
                  <a style={titleStyle}
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
        gridArea="sidebar"
//        isHidden={{ base: true, M: false, L: false }}
        backgroundColor={"gray-50"}
        padding={"size-100"}
        borderBottomWidth={{base: "thin", L:undefined}}
        borderBottomColor={"gray-200"}
      >
        <MainMenu activeMenu={home ? "Home" : activeMenu} user={user} mutateUser={mutateUser} />
      </View>

      <View gridArea="content" backgroundColor="gray-50" height={"100%"}>
        <View paddingX={{ base: "size-75", M: "size-200", L: "size-400" }} marginTop={"size-200"}>
          {children}
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

export default Layout;

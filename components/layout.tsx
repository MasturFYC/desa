import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { iUserLogin } from "@components/interfaces";
import { Grid } from "@react-spectrum/layout";
import { View } from "@react-spectrum/view";
import MainMenu from "./main-menu";
import { Footer } from "@adobe/react-spectrum";

export const siteTitle = "SPBU";

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
      columns={["1fr", "2fr"]}
      rows={["size-1000", "auto", "size-1000"]}
      minHeight={"100vh"}      
    >
      <View gridArea="header" backgroundColor="gray-50"
        paddingTop={"size-100"} paddingX={{ base: "size-75", M: "size-400" }}>Sumber Ikan Putri</View>
      
      <View
        gridArea="sidebar"
        isHidden={{ base: true, M: false, L: false }}        
        backgroundColor={"gray-100"}
        padding={"size-100"}
      >
        <MainMenu activeMenu={home ? "Home" : activeMenu} />
      </View>
      
      <View gridArea="content" backgroundColor="gray-50" height={"100%"}>
        <View paddingX={{ base: "size-75", M: "size-200", L: "size-400" }}>
          {children}
        </View>
      </View>

      <Footer gridArea="footer" flex>
        <View flex paddingTop={"size-100"} paddingX={{base:"size-75", M:"size-400"}}>&copy; All rights reserved.</View>
      </Footer>
    </Grid>
  );
};

export default Layout;

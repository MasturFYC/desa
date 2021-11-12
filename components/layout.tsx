import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { iUserLogin } from "@components/interfaces";
import { Grid } from "@react-spectrum/layout";
import { View } from "@react-spectrum/view";
import { Divider } from "@react-spectrum/divider";

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
      }}
      columns={["1fr", "3fr"]}
      rows={["size-1000", "auto", "size-1000"]}
      minHeight={"100vh - (size-100 * 2))"}
      columnGap={"size-100"}
    >
      <View gridArea="header" backgroundColor="gray-50" />
      <View
        isHidden={{ base: true, M: false, L: false }}
        gridArea="sidebar"
        backgroundColor={"gray-100"}
      ></View>
      <View gridArea="content" backgroundColor="gray-50">
        <View paddingX={{ base: "size-50", M: "size-200", L: "size-400" }}>
          {children}
        </View>
      </View>
      <View gridArea="footer">
        <Divider size="S" />
      </View>
    </Grid>
  );
};

export default Layout;

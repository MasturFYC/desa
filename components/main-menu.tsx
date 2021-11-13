import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { iUserLogin } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";

export const siteTitle = "SPBU";

type MenuType = {
  id: number;
  name: string;
  link: string;
};

const menus: MenuType[] = [
  {
    id: 0,
    name: "Home",
    link: "/",
  },
  {
    id: 1,
    name: "Pelanggan",
    link: "/customer",
  },
  {
    id: 2,
    name: "Produk",
    link: "/product",
  },
  {
    id: 3,
    name: "Pembelian",
    link: "/buy",
  },
  {
    id: 4,
    name: "Penjualan",
    link: "/sale",
  },
];

type LayoutProps = {
  activeMenu?: string;
  user?: iUserLogin;
};

const MainMenu:NextPage<LayoutProps> = (props) => {
  const { user, activeMenu } = props;
  const router = useRouter();
  return (
    <>
        {menus && menus.map((x,i)=> (
          <View 
          key={x.id}
          padding={"size-125"}
          // backgroundColor={activeMenu === x.name ? "indigo-600" : "transparent"}
          borderStartColor={activeMenu === x.name ? "orange-500" : "transparent"}
          borderStartWidth={"thicker"}
          //borderRadius={"medium"}
          ><Link href={x.link} passHref><a style={{
            textDecoration: 'none',
            //color: activeMenu === x.name ? "white" : "black",
            fontWeight: activeMenu === x.name ? 700 : 400,
          }}>{x.name}</a></Link></View>
        ))}
    </>
  );
};

export default MainMenu;

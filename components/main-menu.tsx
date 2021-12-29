import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { iUserLogin } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import fetchJson from "@lib/fetchJson";
import { KeyedMutator } from "swr";

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
  }
  ,
  {
    id: 5,
    name: "Supplier",
    link: "/supplier",
  }, {
    id: 3,
    name: "Pembelian (Stock)",
    link: "/stock",
  },
  {
    id: 4,
    name: "Penjualan (Toko)",
    link: "/orders",
  },
  {
    id: 6,
    name: "Penjualan (Khusus)",
    link: "/special-order",
  },
  {
    id: 7,
    name: "Laporan",
    link: "/report",
  }
];

type LayoutProps = {
  activeMenu?: string;
  user?: iUserLogin;
  mutateUser?: KeyedMutator<iUserLogin>
};

const MainMenu: NextPage<LayoutProps> = (props) => {
  const { user, activeMenu, mutateUser } = props;
  const router = useRouter();

  return (
    <Flex direction={{ base: "row", M: "row", L: "column" }} wrap={{ base: "wrap", L: "nowrap" }} gap={{ base: "size-25", L: "size-100" }}>
      {user?.admin && menus && menus.map((x, i) => (
        <View
          isHidden={{ base: i === 0 ? true : false, M: false }}
          key={x.id}
          alignSelf={{ base: "end", L: "self-start" }}
          paddingStart={{ base: 0, L: "size-100" }}
          // backgroundColor={activeMenu === x.name ? "indigo-600" : "transparent"}
          borderStartColor={{ base: "transparent", L: activeMenu === x.name ? "orange-500" : "transparent" }}
          borderStartWidth={{ base: undefined, L: "thicker" }}
          borderBottomColor={{ base: activeMenu === x.name ? "orange-500" : "transparent", L: "transparent" }}
          borderBottomWidth={{ base: "thick", L: undefined }}
        //borderRadius={"medium"}
        ><Link href={x.link} passHref><a style={{
          textDecoration: 'none',
          //color: activeMenu === x.name ? "white" : "black",
          // fontWeight: activeMenu === x.name ? 700 : 400,
        }}>{x.name}</a></Link></View>
      ))}
      <View
        paddingStart={{ base: 6, L: "size-125" }}
        alignSelf={{ base: "end", L: "self-start" }}
      >

        {!user?.isLoggedIn && (
          <Link href="/login"><a>Login</a></Link>
        )}
        {user?.isLoggedIn === true && (
          <Link href="/api/logout" passHref>
            <a
              onClick={async (e) => {
                e.preventDefault();
                mutateUser && mutateUser(
                  await fetchJson(process.env.apiKey + "/logout", { method: "POST" }),
                  false,
                );
                router.push("/");
              }}
            >
              Logout{' '} {user.login}!
            </a>
          </Link>
        )}
      </View>
    </Flex>
  );
};

export default MainMenu;

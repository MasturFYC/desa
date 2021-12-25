import Head from "next/head";
import dynamic from "next/dynamic";
import React from "react";
import { useAsyncList } from "@react-stately/data";
import Layout from "@components/layout";
import { iProduct, iCategory } from "@components/interfaces";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import { useRouter } from "next/router";

const ProductList  = dynamic(() => import("./ProductList"), {
  ssr: false,
});

const ProductInfo  = dynamic(() => import("./productInfo"), {
  ssr: false,
});

const siteTitle = "Produk";

const ProductComponent: NextPage = () => {
  const { query } = useRouter();

  let categories = useAsyncList<iCategory>({
    async load({ signal }) {
      let res = await fetch("http://localhost:8000/categories/", {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();
      return { items: [{ id: 0, name: "All" }, ...json] };
    },
    getKey: (item: iCategory) => item.id,
  });

  let products = useAsyncList<iProduct>({
    async load({ signal }) {
      let res = await fetch("http://localhost:8000/products/", {
        signal,
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iProduct) => item.id,
  });

  return (
    <Layout activeMenu={siteTitle}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <View marginBottom={"size-400"}>
        <span style={{ fontWeight: 700, fontSize: "24px" }}>
          Data {siteTitle}
        </span>
      </View>

      {categories.isLoading || products.isLoading && <WaitMe />}
      {query && query.id && products ? <ProductInfo product={products.getItem(+query.id.toString())}
        category={categories.getItem(query.c ? +query.c.toString() : 0)
      } /> : 
      <ProductList categories={categories} products={products} />
      }
    </Layout>
  );
};

export default ProductComponent;



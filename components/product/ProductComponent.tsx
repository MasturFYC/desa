import Head from "next/head";
import dynamic from "next/dynamic";
import React, { FormEvent, Fragment, useEffect, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import Layout from "@components/layout";
import { iUnit, iProduct } from "@components/interfaces";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Divider } from "@react-spectrum/divider";
import { ActionButton } from "@react-spectrum/button";
import { NextPage } from "next";
import { SearchField } from "@react-spectrum/searchfield";
import { FormatNumber } from "@lib/format";
import Pin from '@spectrum-icons/workflow/PinOff'
import UnitComponent from "@components/unit/UnitComponent";
import { ToggleButton } from "@react-spectrum/button";
import { Text } from "@react-spectrum/text";
import { initProduct } from "./form";
import SpanLink from "@components/ui/span-link";

const ProductForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false
})

const siteTitle = "Produk";

const ProductComponent: NextPage = () => {
  let [selectedId, setSelectedId] = React.useState<number>(-1);
  let [txtSearch, setTxtSearch] = React.useState<string>("");
  let [message, setMessage] = React.useState<string>("");

  let products = useAsyncList<iProduct>({
    async load({ signal }) {
      let res = await fetch("/api/product", { signal });
      let json = await res.json();
      return { items: [initProduct, ...json] };
    },
    getKey: (item: iProduct) => item.id,
  });

  const searchProduct = async () => {

    const txt = txtSearch.toLocaleLowerCase();
    const url = `/api/product/search/${txt}`;
    const fetchOptions = {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    await fetch(url, fetchOptions)
      .then(async (response) => {
        if (response.ok) {
          return response.json().then((data) => data);
        }
        return response.json().then((error) => {
          return Promise.reject(error);
        });
      })
      .then((data) => {
        products.setSelectedKeys("all");
        products.removeSelectedItems();
        products.insert(0, initProduct, ...data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteData = async (id: number) => {
    const url = `/api/product/${id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iProduct | any = await res.json();

    if (res.status === 200) {
      products.remove(id);
    } else {
      console.log("Produk tidak dapat dihapus!");
      setMessage('Produk tidak dapat dihapus')
    }
  };

  const postProduct = (method: string, id: number, p: iProduct) => {
    if (method === "DELETE") {
      deleteData(id);
    } else {
      updateProduct(method, id, p);
    }
  };

  async function updateProduct(method: string, id: number, p: iProduct) {
    const url = `/api/product/${id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: {
        id: p.id,
        name: p.name,
        spec: p.spec,
        price: p.price,
        stock: p.stock,
        firstStock: p.firstStock,
        unit: p.unit
      } }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      if (method === "POST") {
        products.insert(1, json);
      } else {
        products.update(id, {...json, units: p.units});
      }
      closeForm();
    } else {
      console.log(json.message)
      setMessage('Data produk tidak dapat diupdate, mungkin nama produk sama.')
    }
  }

  const closeForm = () => {
    setSelectedId(-1);
    setMessage('')
  };

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
      <Flex justifyContent={"center"} marginY={"size-250"}>
        <SearchField        
          alignSelf="center"
          justifySelf="center"
          aria-label="Search product"
          placeholder="e.g. abachel"
          width="auto"
          maxWidth="size-3600"
          value={txtSearch}
          onClear={() => products.reload()}
          onChange={(e) => setTxtSearch(e)}
          onSubmit={() => searchProduct()}
        />
      </Flex>
      {products.isLoading && <WaitMe />}
      <Divider size="S" />
      {products && products.items.map((x, i) => (
          <View key={x.id}>
            <View
              borderColor={selectedId === x.id ? "indigo-500" : "transparent"}
              paddingStart={selectedId === x.id ? "size-100" : 0}
              borderStartWidth={"thickest"}
              marginY={"size-50"}
            >
              <Flex
                direction={{ base: "column", M: "row" }}
                rowGap={"size-100"}
                columnGap="size-400"
              >
                <View width={{ base: "auto", M: "35%" }}>
                  <SpanLink
                    onClick={() => {
                      setSelectedId(selectedId === x.id ? -1 : x.id);
                    }}
                  >
                    {x.id === 0 ? 'Produk Baru' : `${x.name}${x.spec && ', '+ x.spec}`}
                  </SpanLink>                  
                </View>
                {x.id > 0 && (
                  <View flex>
                    ID#: <strong>{x.id}</strong>{", "}
                    Harga: <strong>{FormatNumber(x.price)}</strong>
                    <br />
                    Stock Awal: <strong>{FormatNumber(x.firstStock)} {x.unit}</strong>{", "}
                    Sisa Stock: <strong>{FormatNumber(x.stock)} {x.unit}</strong>
                  </View>
                )}
              </Flex>
              {x.id > 0 && selectedId !== x.id && <ToggleUnit data={x} />}
              {selectedId === x.id && (
                <Fragment>
                  <View paddingX={{ base: 0, M: "size-1000" }}>
                    <ProductForm
                      data={x}
                      updateProduct={postProduct}
                      closeForm={closeForm}
                    />
                    <View marginY={"size-100"}><span style={{ color: 'red' }}>{message}</span></View>
                  </View>
                </Fragment>
              )}
            </View>
            <Divider size="S" />
          </View>
        ))}
        <div style={{marginBottom: '24px'}} />
    </Layout>
  );
};


type ToggleUnitProps = {
  data: iProduct
}

function ToggleUnit({
  data
}: ToggleUnitProps) {
  let [isShow, setIsShow] = useState<boolean>(false);
  return (
    <View flex marginTop={{ base: 18, M: -18 }}>
      <ToggleButton flex height={"auto"} isEmphasized isSelected={isShow} onChange={setIsShow} isQuiet marginBottom={"size-100"}>
        <Pin aria-label="Pin" size="S" />
        <Text>Unit</Text>
      </ToggleButton>

      {isShow && <UnitComponent productId={data.id} price={data.price} unit={data.unit} />}
    </View>
  )
}

export default ProductComponent;



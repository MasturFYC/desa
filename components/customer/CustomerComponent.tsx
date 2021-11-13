import Head from "next/head";
import Link from "next/link";
import React, { FormEvent, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import Layout from "@components/layout";
import { customerType, iCustomer } from "@components/interfaces";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Divider } from "@react-spectrum/divider";
import { ActionButton } from "@react-spectrum/button";
import { NextPage } from "next";
import CustomerForm from "./form";
import customer from ".";
import { SearchField } from "@react-spectrum/searchfield";

const siteTitle = "Pelanggan";

const initCustomer: iCustomer = {
  id: 0,
  name: "Pelanggan Baru",
  street: "Jl. Pantai Song",
  city: "Indramayu",
  phone: "085-5556-65656",
  customerType: customerType.BANDENG,
};

const CustomerComponent: NextPage = () => {
  let [selectedId, setSelectedId] = React.useState<number>(-1);
  let [txtSearch, setTxtSearch] = React.useState<string>("");
  let [message, setMessage]  = React.useState<string>("");

  let customers = useAsyncList<iCustomer>({
    async load({ signal }) {
      let res = await fetch("/api/customer", { signal });
      let json = await res.json();
      return { items: [initCustomer, ...json] };
    },
    getKey: (item: iCustomer) => item.id,
  });

  const searchCustomer = async () => {

    const txt = txtSearch.toLocaleLowerCase();
    const url = `/api/customer/search/${txt}`;
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
        customers.setSelectedKeys("all");
        customers.removeSelectedItems();
        customers.insert(0, initCustomer, ...data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteData = async (id: number) => {
    const url = `/api/customer/${id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iCustomer | any = await res.json();

    if (res.status === 200) {
      //customers.selectedKeys= new Set(id.toString());
      customers.remove(id);
    } else {
      console.log("Pelanggan tidak dapat dihapus!");
      setMessage(data)
    }
  };

  const postCustomer = (method: string, id: number, p: iCustomer) => {
    if (method === "DELETE") {
      deleteData(id);
    } else {
      updateCustomer(method, id, p);
    }
  };

  async function updateCustomer(method: string, id: number, p: iCustomer) {
    const url = `/api/customer/${id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: p }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      if (method === "POST") {
        customers.insert(1, json);
      } else {
        customers.update(id, json);
      }
      closeForm();
    } else {
      console.log(json.message)
      setMessage('Data pelanggan tidak dapat diupdate, mungkin nama pelanggan sama.')
    }
  }

  const closeForm = () => {
    setSelectedId(-1);
    setMessage('')
  };

  return (
    <Layout activeMenu={"Pelanggan"}>
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
          placeholder="e.g. turbo"
          width="auto"
          maxWidth="size-3600"
          value={txtSearch}
          onClear={() => customers.reload()}
          onChange={(e) => setTxtSearch(e)}
          onSubmit={() => searchCustomer()}
        />
      </Flex>
      {customers.isLoading && <WaitMe />}
      <Divider size="S" />
      {customers &&
        customers.items.map((x, i) => (
          <View key={x.id}>
            <View
              borderColor={selectedId === x.id ? "indigo-500" : "transparent"}
              paddingStart={selectedId === x.id ? "size-100" : 0}
              borderStartWidth={"thickest"}
              marginY={"size-125"}
            >
              <Flex
                direction={{ base: "column", M: "row" }}
                rowGap={"size-100"}
                columnGap="size-400"
              >
                <View width={{ base: "auto", M: "35%" }}>
                  <ActionButton
                    flex
                    isQuiet
                    onPress={() => {
                      setSelectedId(selectedId === x.id ? -1 : x.id);
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{x.name}</span>
                  </ActionButton>
                </View>
                {x.id > 0 && (
                  <View flex>
                    <strong>{x.customerType}</strong>
                    <br />
                    {x.street}
                    {", "}
                    {x.city}
                    {" - "}
                    {x.phone}
                  </View>
                )}
              </Flex>
              {selectedId === x.id && (
                <View>
                  <CustomerForm
                    data={x}
                    updateCustomer={postCustomer}
                    closeForm={closeForm}
                  />
                  <View marginY={"size-250"}><span style={{color: 'red'}}>{message}</span></View>
                </View>
              )}
            </View>
            <Divider size="S" />
          </View>
        ))}
    </Layout>
  );
};

export default CustomerComponent;

import Head from "next/head";
import dynamic from "next/dynamic";
import router from "next/router";

import { Fragment, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import Layout from "@components/layout";
import { customerType, iCustomer } from "@components/interfaces";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Divider } from "@react-spectrum/divider";
import { ActionButton } from "@react-spectrum/button";
import { NextPage } from "next";
import { SearchField } from "@react-spectrum/searchfield";
import InfoIcon from '@spectrum-icons/workflow/Info'
import SpanLink from "@components/ui/span-link";
import { Picker } from "@react-spectrum/picker";
import { Item } from "@react-spectrum/combobox";

const CustomerForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const siteTitle = 'Pelanggan';

const initCustomer: iCustomer = {
  id: 0,
  name: '',
  customerType: customerType.BANDENG,
};

const CustomerComponent: NextPage = () => {
  let [selectedId, setSelectedId] = useState<number>(-1);
  let [txtSearch, setTxtSearch] = useState<string>("");
  let [message, setMessage] = useState<string>("");
  let [customerSearch, setCustomerSearch] = useState<string>('');
  let [custType, setCustType] = useState<string>('All');

  let customers = useAsyncList<iCustomer>({
    async load({ signal }) {
      let res = await fetch(process.env.apiKey + '/customer', { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iCustomer) => item.id
  });

  const searchCustomer = async () => {

    //customers.setFilterText(txtSearch);
    setCustomerSearch(txtSearch);
    // const txt = txtSearch.toLocaleLowerCase();
    // const url = `${process.env.apiKey}/customer/search/${txt}`;
    // const fetchOptions = {
    //   method: "GET",
    //   headers: {
    //     "Content-type": "application/json; charset=UTF-8",
    //   },
    // };

    // await fetch(url, fetchOptions)
    //   .then(async (response) => {
    //     if (response.ok) {
    //       return response.json().then((data) => data);
    //     }
    //     return response.json().then((error) => {
    //       return Promise.reject(error);
    //     });
    //   })
    //   .then((data) => {
    //     customers.setSelectedKeys("all");
    //     customers.removeSelectedItems();
    //     customers.insert(0, initCustomer, ...data);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  };

  const deleteData = async (id: number) => {
    const url = `${process.env.apiKey}/customer/${id}`;
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
    const url = `${process.env.apiKey}/customer/${id}`;
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
      <Flex justifyContent={"center"} marginY={"size-250"} gap={"size-100"} direction={{base: "column", M:"row"}}>
        <View flex>
        <Picker
            aria-label={"Customer type list"}
            flex={{ base: 1, M: "none" }}
            placeholder={"Tipe pelanggan"}
            width={{base:"100%", M:"size-2400"}}            
            defaultSelectedKey={custType}
            selectedKey={custType}
            onSelectionChange={(e) =>
              setCustType(e.toString())
            }
          >
            {['All', ...Object.values(customerType)].map(item => <Item key={item}>{item}</Item>)}
          </Picker>
          </View>
        <SearchField
          aria-label="Search product"
          placeholder="e.g. kosim"
          width={"auto"}
          flex={{base: 1, M:"none"}}
          value={txtSearch}
          onClear={() => setCustomerSearch('')}
          onChange={(e) => setTxtSearch(e)}
          onSubmit={() => searchCustomer()}
        />
      </Flex>
      {customers.isLoading && <WaitMe />}
      <Divider size="S" />
      {customers &&
        [initCustomer, 
          ...(custType ==='All' ?
          (customerSearch.length > 0
            ? customers.items.filter(f=>f.name.toLocaleLowerCase().includes(customerSearch.toLocaleLowerCase())) 
            : customers.items)
          : (customers.items.filter(ct=>ct.customerType === custType)))
        ]
        .map((x, i) => (
          <View
            marginBottom={'size-50'}
            key={x.id}>
              <div style={{
                padding: "12px 6px",
                paddingLeft: selectedId === x.id ? "24px" : "12px",
                borderLeft: selectedId === x.id ? "8px solid #ddccef" :"none",
                backgroundColor: x.id === 0 ? "gray-50" : x.customerType === customerType.PABRIK  ? "#c8cfd8" : x.customerType === customerType.BANDENG ? "#d8f8e8" : "#f8efdf"
              }}>
            <View
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
                    {x.id === 0 ? 'Pelanggan Baru' : x.name}
                  </SpanLink>
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
                {x.id > 0 && (
                <View>
                  <ActionButton isQuiet
                        onPress={() => router.push(x.customerType === customerType.PABRIK ? "/special-customer/" + x.id : "/customer/"+x.id)}
                  ><InfoIcon size="S" /></ActionButton>
                </View>)}
              </Flex>
              {selectedId === x.id && (
                <Fragment>
                  <View paddingX={{ base: 0, M: "size-1000" }}>
                    <CustomerForm
                      data={x}
                      updateCustomer={postCustomer}
                      closeForm={closeForm}
                    />
                    <View marginY={"size-250"}><span style={{ color: 'red' }}>{message}</span></View>
                  </View>
                </Fragment>
              )}
            </View>
            </div>
          </View>
        ))}
      <div style={{ marginBottom: '24px' }} />
    </Layout>
  );
};

export default CustomerComponent;

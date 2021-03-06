import Head from "next/head";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import Layout from "@components/layout";
import { iCustomer } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Item, TabList, Tabs } from "@react-spectrum/tabs";


const siteTitle = "Pelanggan";

const CustomerPiutang = dynamic(() => import("./piutang"), {
  ssr: false,
});

const PiutangDagang = dynamic(() => import("./piutang-dagang"), {
  ssr: false,
});

const Payment = dynamic(() => import("./payment"), {
  ssr: false,
});


type tabContent = {
  id: number;
  name: string;
};

const tabs: tabContent[] = [
  { id: 0, name: "Informasi" },
  { id: 1, name: "Piutang Dagang" },
  { id: 2, name: "Angsuran" },
];

const SpecialCustomerComponent: NextPage = () => {
  const { query: queryParams } = useRouter();
  let [tabId, setTabId] = React.useState(0);
  let [customerId, setCustomerId] = useState<number>(0);
  let [customer, setCustomer] = useState<iCustomer>({} as iCustomer);

  useEffect(() => {
    let isLoaded = false;

    const loadCustomer = async (id: number) => {
      const url = `${process.env.apiKey}/customer/${id}`;
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
          setCustomer(data);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    if (!isLoaded && queryParams.id) {
      let s = queryParams.id;
      setCustomerId(+(s || 0));
      loadCustomer(+(s || 0));
    }

    return () => {
      isLoaded = true;
    };
  }, [queryParams]);

  return (
    <Layout activeMenu={"Pelanggan"}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <View>
        <span style={{ fontWeight: 700, fontSize: "24px" }}>
          {customer.name}
        </span>
      </View>

      <Tabs
        marginBottom={"size-400"}
        density={"compact"}
        aria-label="Informasi data pelanggan"
        items={tabs}
        onSelectionChange={(e) => setTabId(+e)}
      >
        <TabList>{(item: tabContent) => <Item>{item.name}</Item>}</TabList>
      </Tabs>
      {tabId === 0 && (
        <View>
          <View marginBottom={"size-200"}>
            <strong>Pelanggan {customer.customerType}</strong>
          </View>
          <View marginBottom={"size-400"}>
            <span>
              {customer.street} - {customer.city}
            </span>
            <br />
            <span>Telp. {customer.phone}</span>
          </View>

          {customerId > 0 && <CustomerPiutang customerId={customerId} />}
        </View>
      )}
      {tabId === 1 && <PiutangDagang customer={customer} />}
      {tabId === 2 && <Payment customerId={customerId} />}
    </Layout>
  );
};

export default SpecialCustomerComponent;

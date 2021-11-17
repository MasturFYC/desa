import Head from "next/head";
import dynamic from "next/dynamic";
import React, { FormEvent, Fragment, useEffect, useState } from "react";
import Layout from "@components/layout";
import { iCustomer } from "@components/interfaces";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Item, TabList, Tabs } from "@adobe/react-spectrum";

const siteTitle = "Pelanggan";

const CustomerPiutang = dynamic(() => import("./CustomerPiutang"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const PiutangBarang = dynamic(() => import("./piutang-barang"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const Kasbon = dynamic(() => import("./kasbon"), {
  loading: () => <WaitMe />,
  ssr: false,
});

type tabContent = {
  id: number;
  name: string;
};

const tabs: tabContent[] = [
  {
    id: 0,
    name: "Informasi",
  },
  {
    id: 1,
    name: "Piutang Barang",
  },
  {
    id: 2,
    name: "Piutang Kasbon",
  },
  {
    id: 3,
    name: "Pembelian",
  },
  { id: 4, name: "Angsuran" },
];

const CustomerDetailComponent: NextPage = () => {
  const { query: queryParams } = useRouter();
  let [tabId, setTabId] = React.useState(0);
  let [customerId, setCustomerId] = useState<number>(0);
  let [customer, setCustomer] = useState<iCustomer>({} as iCustomer);

  useEffect(() => {
    let isLoaded = false;

    const loadCustomer = async (id: number) => {
      const url = `/api/customer/${id}`;
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
            <span>Telp.{customer.phone}</span>
          </View>

          <CustomerPiutang customerId={customerId} />
        </View>
      )}
      {tabId === 1 && <PiutangBarang customerId={customerId} />}
      {tabId === 2 && <Kasbon customerId={customerId} />}
    </Layout>
  );
};

export default CustomerDetailComponent;

import Head from "next/head";
import dynamic from "next/dynamic";
import React, { FormEvent, Fragment, useEffect, useState } from "react";
import Layout from "@components/layout";
import { iSupplier } from "@components/interfaces";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Item, TabList, Tabs } from "@react-spectrum/tabs";


const siteTitle = "Supplier";

const Supplier = dynamic(() => import("./supplier-piutang"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const PiutangDagang = dynamic(() => import("./hutang-dagang"), {
   loading: () => <WaitMe />,
   ssr: false,
});

const StockPaymentPage = dynamic(() => import("./payment"), {
   loading: () => <WaitMe />,
   ssr: false,
 });

// const Payment = dynamic(() => import("./payment"), {
//   loading: () => <WaitMe />,
//   ssr: false,
// });

type tabContent = {
  id: number;
  name: string;
};

const tabs: tabContent[] = [
  { id: 0, name: "Informasi" },
  { id: 1, name: "Hutang Usaha" },
  { id: 2, name: "Angsuran" },
];

const SupplierDetailComponent: NextPage = () => {
  const { query: queryParams } = useRouter();
  let [tabId, setTabId] = React.useState(0);
  let [supplierId, setSupplierId] = useState<number>(0);
  let [supplier, setSupplier] = useState<iSupplier>({} as iSupplier);

  useEffect(() => {
    let isLoaded = false;

    const loadSupplier = async (id: number) => {
      const url = `${process.env.apiKey}/supplier/${id}`;
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
          setSupplier(data);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    if (!isLoaded && queryParams.id) {
      let s = queryParams.id;
      setSupplierId(+(s || 0));
      loadSupplier(+(s || 0));
    }

    return () => {
      isLoaded = true;
    };
  }, [queryParams]);

  return (
    <Layout activeMenu={"Supplier"}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <View>
        <span style={{ fontWeight: 700, fontSize: "24px" }}>
          {supplier.name}
        </span>
      </View>

      <Tabs
        marginBottom={"size-400"}
        density={"compact"}
        aria-label="Informasi data supplier"
        items={tabs}
        onSelectionChange={(e) => setTabId(+e)}
      >
        <TabList>{(item: tabContent) => <Item>{item.name}</Item>}</TabList>
      </Tabs>
      {tabId === 0 && (
        <View>
          <View marginBottom={"size-400"}>
            <span>Sales: {supplier.salesName}</span>
            <br />
            <span>
              {supplier.street} - {supplier.city}
            </span>
            <br />
            <span>Telp. {supplier.phone} / Cellular: {supplier.cell}</span>
            <br />
            <span>email: {supplier.email}</span>
          </View>

          {supplierId > 0 && <Supplier supplierId={supplierId} />}
        </View>
      )}
      {tabId === 1 && <PiutangDagang supplierId={supplierId} />}
      {tabId === 2 && <StockPaymentPage supplierId={supplierId} />}
    </Layout>
  );
};

export default SupplierDetailComponent;

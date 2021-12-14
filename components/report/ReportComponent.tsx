import Head from "next/head";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import Layout from "@components/layout";
import { dateOnly, dateParam } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import { Item, TabList, Tabs } from "@react-spectrum/tabs";
import { TextField } from "@react-spectrum/textfield";
import ReportLrPenjualanProcut from "./lr-penjualan-product";

const siteTitle = "Laporan";

type tabContent = {
  id: number;
  name: string;
};

const ReportLrPenjualanToko = dynamic(() => import("./lr-penjualan-toko"), {
  ssr: false,
});
const ReportLrPenjualanProduct = dynamic(() => import("./lr-penjualan-product"), {
  ssr: false,
});

const tabs: tabContent[] = [
  { id: 0, name: "Laba/Rugi Penjualan Toko" },
  { id: 1, name: "Laba/Rugi Penjualan Produk" },
  { id: 2, name: "Piutang Pelanggan" },
  { id: 3, name: "Utang Usaha" },
];

const ReportComponent: NextPage = () => {
  let [startDate, setStartDate] = useState<string>(dateParam());
  let [endDate, setEndDate] = useState<string>(dateParam());

  let [tabId, setTabId] = React.useState(0);


  return (
    <Layout activeMenu={siteTitle}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <View>
        <span style={{ fontWeight: 700, fontSize: "24px" }}>{siteTitle}</span>
      </View>
      <View></View>
      <Tabs
        marginBottom={"size-400"}
        density={"compact"}
        aria-label="Informasi data pelanggan"
        items={tabs}
        onSelectionChange={(e) => setTabId(+e)}
      >
        <TabList>{(item: tabContent) => <Item>{item.name}</Item>}</TabList>
      </Tabs>
      <View>
      {tabId === 0 && (
          <ReportLrPenjualanToko startDate={startDate} endDate={endDate}>
            {DateChild(startDate, setStartDate, endDate, setEndDate)}
          </ReportLrPenjualanToko>
        )}
        {tabId === 1 && (
          <ReportLrPenjualanProcut startDate={startDate} endDate={endDate}>
            {DateChild(startDate, setStartDate, endDate, setEndDate)}
          </ReportLrPenjualanProcut>
        )}
      </View>
    </Layout>
  );
};

export default ReportComponent;
function DateChild(startDate: string, setStartDate: React.Dispatch<React.SetStateAction<string>>, endDate: string, setEndDate: React.Dispatch<React.SetStateAction<string>>) {
  return <>
    <TextField
      type={"date"}
      width={"auto"}
      placeholder={"e.g. dd/mm/yyyy"}
      labelPosition={"side"}
      label={"Dari tanggal:"}
      value={dateOnly(startDate)}
      onChange={(e) => setStartDate(e)} />
    <TextField
      type={"date"}
      width={"auto"}
      placeholder={"e.g. dd/mm/yyyy"}
      labelPosition={"side"}
      label={"Sampai tanggal:"}
      value={dateOnly(endDate)}
      onChange={(e) => setEndDate(e)} />
  </>;
}


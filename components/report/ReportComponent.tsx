import Head from "next/head";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import Layout from "@components/layout";
import { dateParam } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import { Item, TabList, Tabs } from "@react-spectrum/tabs";
import { FilterForm, FormFilterType } from "./filter-form";
import { FilterTab, FilterTabType } from "./lr-penjualan-year";

const siteTitle = "Laporan";

type tabContent = {
  id: number;
  name: string;
};

const ReportLrPenjualanByDate = dynamic(() => import("./lr-penjualan-date"), {
  ssr: false,
});

 const ReportLrPenjualanByYear = dynamic(() => import("./lr-penjualan-year"), {
   ssr: false,
 });

const tabs: tabContent[] = [
  { id: 0, name: "Laba/Rugi Per Tanggal" },
  { id: 1, name: "Laba/Rugi Tahunan" },
  { id: 2, name: "Piutang Pelanggan" },
  { id: 3, name: "Utang Usaha" },
];

const months = [
  { id: 0, name: 'All' },
  { id: 1, name: 'Januari' },
  { id: 2, name: 'Februari' },
  { id: 3, name: 'Maret' },
  { id: 4, name: 'April' },
  { id: 5, name: 'Mei' },
  { id: 6, name: 'Juni' },
  { id: 7, name: 'Juli' },
  { id: 8, name: 'Agustus' },
  { id: 9, name: 'September' },
  { id: 10, name: 'Oktober' },
  { id: 11, name: 'Nopember' },
  { id: 12, name: 'Desember' }
];

const ReportComponent: NextPage = () => {
  let [filter, setFilter] = useState<FormFilterType>({
    startDate: dateParam(),
    endDate: dateParam(),
    saleType: 0
  });
  let [filterTab, setFilterTab] = useState<FilterTabType>({
    year: (new Date()).getFullYear(),
    month: (new Date()).getMonth()+1,
    monthName: months[(new Date()).getMonth() + 1].name
  });
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
          <ReportLrPenjualanByDate filter={filter}>
            <FilterForm filter={filter} setFilter={(e) => setFilter(e)} />
          </ReportLrPenjualanByDate>
        )}
        {tabId === 1 && (
          <ReportLrPenjualanByYear filter={filterTab} months={months}>
            <FilterTab filter={filterTab} setFilter={(e) => setFilterTab(e)} months={months} />
          </ReportLrPenjualanByYear>
        )}
    </View>
    </Layout>
  );
};

export default ReportComponent;


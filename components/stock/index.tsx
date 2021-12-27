import { NextPage } from "next";
import { env } from 'process';
import Link from "next/link";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { Checkbox } from "@react-spectrum/checkbox";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import {  SearchField} from "@react-spectrum/searchfield";

import {
  dateParam,
  iStock,
  iProduct,
  iSupplier
} from "@components/interfaces";
import { FormatNumber } from "@lib/format";
import Layout from "@components/layout";
import Head from "next/head";

const RenderStock = dynamic(() => import("@components/stock/RenderStock"), {
  ssr: false,
});

const siteTitle = "Stock"

const StockForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initStock: iStock = {
  id: 0,
  supplierId: 0,
  stockNum: '',
  stockDate: dateParam(null),
  total: 0,
  cash: 0,
  payments: 0,
  remainPayment: 0
};

const StockComponent: NextPage = () => {
  let [stockId, setStockId] = useState<number>(-1);
  let [txtSearch, setTxtSearch] = useState<string>("");
  let [isLunas, setIsLunas] = useState<boolean>(false);
  let [isReload, setIsReload] = useState<boolean>(false);

  let stocks = useAsyncList<iStock>({
    async load({ signal }) {
      let res = await fetch(`${env.apiKey}/stock/?ls=${isLunas?1:0}`, {
        signal,
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        }
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iStock) => item.id,
  });

  let suppliers = useAsyncList<iSupplier>({
    async load({ signal }) {
      let res = await fetch(env.apiKey + '/api/supplier', {
        signal,
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        }
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iSupplier) => item.id,
  });

  let products = useAsyncList<iProduct>({
    async load({ signal }) {
      let res = await fetch(`${env.apiKey}/product/list`, {
        signal,
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        }
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iProduct) => item.id,
  });

  return (
    <Layout activeMenu={"Pembelian (Stock)"}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <View marginBottom={"size-400"}>
        <span style={{ fontWeight: 700, fontSize: "24px" }}>
          Data {siteTitle}
        </span>
      </View>
      <Flex marginY={"size-250"} columnGap={"size-125"}>
        <View flex>
          <Button
            width={"size-1600"}
            variant={"cta"}
            onPress={() => {
              if (!stocks.getItem(0)) {
                stocks.insert(0, initStock);
              }
              setStockId(0);
            }}
          >
            Stock Baru
          </Button>
        </View>
        <View>
          <Checkbox
            isSelected={isLunas}
            aria-label={"Show all orders"}
            onChange={(e) => {

              if(e != isLunas) {
                setIsLunas(!isLunas);
                reloadOrder(e);
              }
            }}
          >
            Show all stocks
          </Checkbox>
        </View>
        <SearchField
          alignSelf="center"
          justifySelf="center"
          aria-label="Search supplier"
          placeholder="e.g. cv. mandiri"
          width="auto"
          maxWidth="size-3600"
          value={txtSearch}
          onClear={() => stocks.reload()}
          onChange={(e) => setTxtSearch(e)}
          onSubmit={() => searchData()}
        />
      </Flex>
      <table>
        <thead>
          <tr>
            <th className={'text-left'}>#ID</th>
            <th className={'text-left'}>FAKTUR</th>
            <th className={'text-left'}>TANGGAL</th>
            <th className={'text-left'}>SUPPLIER</th>
            <th className={'text-right'}>TOTAL</th>
            <th className={'text-right'}>BAYAR</th>
            <th className={'text-right'}>ANGSURAN</th>
            <th className={'text-right'}>UTANG</th>
          </tr>
        </thead>
        <tbody>
          {(products.isLoading || stocks.isLoading) && <tr><td colSpan={7}><WaitMe /></td></tr>}
          {stocks && stocks.items.map((item, index) =>
            item.id === stockId ? (
              <tr key={item.id}>
                <td colSpan={8}>
                  <StockForm
                    updateData={updateData}
                    updateTotal={updateTotal}
                    data={item}
                    closeForm={closeForm}
                    suppliers={suppliers}
                    products={products} />
                </td>
              </tr>
            )
              : (
                <RenderStock key={item.id} item={item} index={index} isStock>
                  <Link href={`#`} as={'/stock/'} passHref><a onClick={() => setStockId(item.id)}>{item.id === 0 ? '---' : item.stockNum}</a></Link>
                </RenderStock>
              ))}
        </tbody>
        <tfoot>
          <tr>
            <th className={'text-left'} colSpan={4}>TOTAL: {stocks.items.length} items</th>
            <th className={'text-right'}>{FormatNumber(stocks.items.reduce((a, b) => a + b.total, 0))}</th>
            <th className={'text-right'}>{FormatNumber(stocks.items.reduce((a, b) => a + b.cash, 0))}</th>
            <th className={'text-right'}>{FormatNumber(stocks.items.reduce((a, b) => a + b.payments, 0))}</th>
            <th className={'text-right'}>{FormatNumber(stocks.items.reduce((a, b) => a + b.remainPayment, 0))}</th>
          </tr>
        </tfoot>
      </table>
      <style jsx>{`
        table {
          width: 100%;
          border-collapse: collapse;
          border: 2px solid #cecece;
          margin-bottom: 24px;
        }
        thead th {
          font-size: 95%;
          font-weight: 600;
          border-bottom: 1px solid #cecece ;
          background-color: #fdf0e9;
        }
        tfoot th {
          font-weight: 700;
          border-top: 1px solid #cecece ;
          background-color: #dfe9f0;
        }
        .text-left {
          text-align: left;
        }
        .text-right {
          text-align: right;
        }
        .text-bold {
          font-weight: 700;
        }
        th {
          border-left: 1px dashed #cecece ;
          padding: 3px 6px;
        }
        td {
          padding: 0px 12px 24px;
          background-color: #dfe9f0;
        }
        `}</style>
    </Layout>
  );

  function closeForm() {
    if (stockId === 0) {
      stocks.remove(0)
    }
    setStockId(-1)
  }


  async function searchData  () {
    const txt = txtSearch.toLocaleLowerCase();
    const url = `${env.apiKey}/stock/search/${txt}`;
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
        stocks.setSelectedKeys("all");
        stocks.removeSelectedItems();
        stocks.insert(0, ...data);
      })
      .catch((error) => {
        console.log(error);
      });
  };


  function updateData (method: string, p: iStock) {

    switch (method) {
      case "POST":
        {
          stocks.update(0, p);
          setStockId(p.id);
          //stocks.remove(0);
        }
        break;
      case "PUT":
        {
          stocks.update(stockId, p);
        }
        break;
      case "DELETE":
        {
          stocks.remove(stockId);
        }
        break;
    }
  };

  function updateTotal (stockId: number, subtotal: number, payments: number) {
    let o = stocks.getItem(stockId);
    let total = o.total + subtotal;
    let remain = total - o.cash - payments;
    stocks.update(stockId, { ...o, payments: payments, total: total, remainPayment: remain });
  };


  async function reloadOrder(all: boolean) {
    setIsReload(true);

    const url = `${env.apiKey}/stock/?ls=${all?1:0}`;
    const fetchOptions = {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      stocks.setSelectedKeys("all");
      stocks.removeSelectedItems();
      stocks.append(...json);
    } else {
      console.log(json.message);
      alert("Data tidak ditemukan.");
    }

    setIsReload(false);
  }

}

export default StockComponent;

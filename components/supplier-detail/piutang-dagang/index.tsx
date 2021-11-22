import dynamic from "next/dynamic";
import React, { Fragment, useEffect, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { Content, View } from "@react-spectrum/view";
import { NextPage } from "next";
import Link from "next/link";
import {
  ActionButton,
  Button,
  Column,
  Divider,
  Flex,
  Heading,
  SearchField
} from "@adobe/react-spectrum";
import {
  dateParam,
  iStock,
  iProduct
} from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";
import supplier from "@components/supplier";

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

const StockPage: NextPage<{ supplierId: number }> = ({ supplierId}) => {
  let [stockId, setStockId] = useState<number>(-1);
  let [txtSearch, setTxtSearch] = useState<string>("");

  let stocks = useAsyncList<iStock>({
    async load({ signal }) {
      let res = await fetch(`/api/supplier/stock/${supplierId}`, {
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

  let products = useAsyncList<iProduct>({
    async load({ signal }) {
      let res = await fetch(`/api/product/list`, {
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

  const searchData = async () => {
    const txt = txtSearch.toLocaleLowerCase();
    const url = `/api/stock/search/${txt}`;
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


  const updateData = (method: string, p: iStock) => {

    switch (method) {
      case "POST":
        {
          stocks.insert(0, p);
          stocks.remove(0);
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

  const updateTotal = (stockId: number, subtotal: number, payments: number) => {
    let o = stocks.getItem(stockId);
    let total = o.total + subtotal;
    let remain = total - o.cash - payments;
    stocks.update(stockId, { ...o, payments: payments, total: total, remainPayment: remain });
  };

  return (
    <Fragment>
      <Flex marginY={"size-250"} columnGap={"size-125"}>
        <View flex>
          <Button
            width={"size-1600"}
            variant={"cta"}
            onPress={() => {
              stocks.insert(0, initStock);
              setStockId(0);
            }}
          >
            Stock Baru
          </Button>
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
      <View backgroundColor="gray-100" paddingY={"size-50"}>
        <Flex direction={"row"} columnGap={"size-50"} marginX={"size-100"}>
          <View width={{ base: "5%", M: "5%" }}>#ID</View>
          <View flex>FAKTUR</View>
          <View width={{ base: "50%", M: "15%" }}>TANGGAL</View>
          <View width={{ base: "50%", M: "13%" }}><span style={{ textAlign: "right", display: "block" }}>TOTAL</span></View>
          <View width={{ base: "50%", M: "13%" }}><span style={{ textAlign: "right", display: "block" }}>BAYAR</span></View>
          <View width={{ base: "50%", M: "13%" }}><span style={{ textAlign: "right", display: "block" }}>ANGSURAN</span></View>
          <View width={{ base: "50%", M: "13%" }}><span style={{ textAlign: "right", display: "block" }}>UTANG</span></View>
        </Flex>
      </View>
      <Divider size="S" />
      {(products.isLoading || stocks.isLoading) && <WaitMe />}
      {stocks &&
        stocks.items.map((item, i) => (
          stockId === item.id ?
            <View key={item.id} backgroundColor={"gray-100"} paddingX={"size-200"} borderWidth={"thin"} borderColor={"gray-300"}
              borderStartColor={"indigo-400"} borderStartWidth={"thickest"}>
              <StockForm
                updateData={updateData}
                updateTotal={updateTotal}
                data={item.id === 0 ? {...initStock, supplierId: supplierId}: item}
                closeForm={closeForm}
                products={products} />
            </View> :
            <RenderStock key={item.id} index={i} item={item}>
              <ActionButton
                isQuiet
                width={"auto"}
                height={"auto"}
                onPress={() => setStockId(item.id)}
              ><span>{item.id === 0 ? '---' : item.stockNum}</span></ActionButton>
            </RenderStock>
        ))
      }
      <br />
    </Fragment>
  );

  function closeForm() {
    setStockId(-1)
  }
}

type RenderStockProps = {
  index: number,
  item: iStock,
  children: JSX.Element
}
function RenderStock({ index, item, children }: RenderStockProps) {
  return (
    <View backgroundColor={index % 2 === 0 ? "gray-50" : "gray-75"} paddingY={"size-50"}>
      <Flex direction={"row"} columnGap={"size-50"} marginX={"size-100"}>
        <View width={{ base: "5%", M: "5%" }}>{item.id}</View>
        <View flex>{children}</View>
        <View width={{ base: "50%", M: "15%" }}>{FormatDate(item.stockDate)}</View>
        <View width={{ base: "50%", M: "13%" }}><span style={{ textAlign: "right", display: "block" }}>{FormatNumber(item.total)}</span></View>
        <View width={{ base: "50%", M: "13%" }}><span style={{ textAlign: "right", display: "block" }}>{FormatNumber(item.cash)}</span></View>
        <View width={{ base: "50%", M: "13%" }}><span style={{ textAlign: "right", display: "block" }}>{FormatNumber(item.payments)}</span></View>
        <View width={{ base: "50%", M: "13%" }}><span style={{ textAlign: "right", display: "block" }}>{FormatNumber(item.remainPayment)}</span></View>
      </Flex>
    </View>
  )
}

export default StockPage;

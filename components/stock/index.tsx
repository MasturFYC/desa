import dynamic from "next/dynamic";
import React, { Fragment, useEffect, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { Content, View } from "@react-spectrum/view";
import { NextPage } from "next";
import {
  ActionButton,
  Button,
  Cell,
  Column,
  Dialog,
  DialogContainer,
  Divider,
  Flex,
  Heading,
  Row,
  SearchField,
  TableBody,
  TableHeader,
  TableView,
  Text,
  ToggleButton,
} from "@adobe/react-spectrum";
import {
  dateParam,
  iStock,
  iProduct
} from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";
import Pin from "@spectrum-icons/workflow/PinOff";
import Layout from "@components/layout";
import Head from "next/head";
import InfoIcon from "@spectrum-icons/workflow/Info";
import Link from "next/link";

const siteTitle = "Stock"

// const StockDetail = dynamic(
//   () => import("./stock-detail"),
//   {
//     loading: () => <WaitMe />,
//     ssr: false,
//   }
// );

// const StockForm = dynamic(() => import("./form"), {
//   loading: () => <WaitMe />,
//   ssr: false,
// });

const initStock: iStock = {
  id: 0,
  supplierId: 0,
  stockNum:'',
  stockDate: dateParam(null),
  total: 0,
  cash: 0,
  payments: 0,
  remainPayment: 0
};

const StockPage: NextPage = () => {
  let [stockId, setStockId] = useState<number>(0);
  let [txtSearch, setTxtSearch] = useState<string>("");
  const [open, setOpen] = React.useState(false);

  let stocks = useAsyncList<iStock>({
    async load({ signal }) {
      let res = await fetch(`/api/stock`, { signal });
      let json = await res.json();
      console.log(json)
      return { items: json };
    },
    getKey: (item: iStock) => item.id,
  });

  // let products = useAsyncList<iProduct>({
  //   async load({ signal }) {
  //     let res = await fetch(`/api/product/list`, { signal });
  //     let json = await res.json();
  //     return { items: json };
  //   },
  //   getKey: (item: iProduct) => item.id,
  // });

  // const closeForm = () => {
  //   setOpen(false)
  // };


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

  const updateTotal = (orderId: number, subtotal: number) => {
    let o = stocks.getItem(orderId);
    let total = o.total + subtotal;
    let remain = total - o.cash - o.payments;

    stocks.update(orderId, { ...o, total: total, remainPayment: remain });
  };

  return (
    <Layout activeMenu={"Pembelian (Stock)"}>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <DialogContainer
        type={"modal"}
        onDismiss={() => setOpen(false)}
        isDismissable
      >
        {open && (
          <Dialog size="L">
            <Heading>
              Stock {stockId}
            </Heading>
            <Divider size="S" />
            <Content>
              {/* <StockForm
                data={
                  stockId === 0
                    ? initStock
                    : stocks.getItem(stockId)
                }
                updateData={updateData}
              /> */}
            </Content>
          </Dialog>
        )}
      </DialogContainer>
            
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
              //setStockId(0);
              setOpen(true);
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
      {/* {products.isLoading && <WaitMe />} */}
      {stocks &&
      <TableView density="compact" aria-label="Stock data list">
        <TableHeader>
            <Column key="id">ID#</Column>
            <Column key="stockNum">No. Faktur</Column>
            <Column key="descriptions">Keterangan</Column>
            <Column key="stockDate">Tanggal</Column>
            <Column key="total">Total</Column>
            <Column key="cash">Cash</Column>
            <Column key="payments">Angsuran</Column>
            <Column key="remainPayment">Utang</Column>
        </TableHeader>
        <TableBody
          items={stocks.items}
          loadingState={stocks.loadingState}
        >
          {(stock) => (
            <Row key={stock.id}>
              <Cell>{stock.id}</Cell>
              <Cell>
                <ActionButton
                  flex
                  justifySelf={"flex-start"}
                  isQuiet
                  width={"auto"}
                  height={"auto"}
                  onPress={() => {
                    setStockId(stock.id);
                    setOpen(true);
                  }}
                >
                  {stock.stockNum}
                </ActionButton>
              </Cell>
              <Cell>{stock.descriptions || '-'}</Cell>
              <Cell>{FormatDate(stock.stockDate)}</Cell>
              <Cell>{FormatNumber(stock.total)}</Cell>
              <Cell>{FormatNumber(stock.cash)}</Cell>
              <Cell>{FormatNumber(stock.payments)}</Cell>
              <Cell>{FormatNumber(stock.remainPayment)}</Cell>
              <Cell>
                <Link href={`/stock/${stock.id}`} passHref>
                <a><InfoIcon size={"S"} /></a>
                </Link>
              </Cell>
            </Row>
          )}
        </TableBody>
      </TableView>}
    </Layout>
  );
}

export default StockPage;

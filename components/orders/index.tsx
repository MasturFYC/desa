import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import { View } from "@react-spectrum/view";
import { Checkbox } from "@react-spectrum/checkbox";
import { SearchField } from "@react-spectrum/searchfield";
import { ActionButton, Button } from "@react-spectrum/button";
import { Flex } from "@react-spectrum/layout";
import { Text } from "@react-spectrum/text";
import Layout from "@components/layout";
import WaitMe from "@components/ui/wait-me";
import { FormatDate, FormatNumber } from "@lib/format";
import {
  dateParam,
  iCustomer,
  iProduct,
} from "@components/interfaces";
import Div from "@components/ui/Div";
import Span from "@components/ui/SpanValue";
import { CustomerOrder } from "./form";

const siteTitle = "Penjualan (Toko)"

const OrderDetail = dynamic(
  () => import("@components/customer-detail/piutang-barang/order-detail"),
  {
    loading: () => <WaitMe />,
    ssr: false,
  }
);

const OrderForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initOrder: CustomerOrder = {
  id: 0,
  customerId: 0,
  orderDate: dateParam(null),
  total: 0,
  lunasId:0,
  name: "",
  payment: 0,
  remainPayment: 0,
  descriptions: "Penjualan Umum",
};


const OrderComponent: NextPage = () => {
  let [txtSearch, setTxtSearch] = useState<string>("");
  let [selectedOrderId, setSelectedOrderId] = useState<number>(-1);
  let [isLunas, setIsLunas] = useState<boolean>(false);
  let [isReload, setIsReload] = useState<boolean>(false);

  let products = useAsyncList<iProduct>({
    async load({ signal }) {
      let res = await fetch(`/api/product/list`, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        }
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iProduct) => item.id,
  });

  let customers = useAsyncList<iCustomer>({
    async load({ signal }) {
      let res = await fetch(`/api/customer`, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        }
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iCustomer) => item.id,
  });

  let orders = useAsyncList<CustomerOrder>({
    async load({ signal }) {
      let res = await fetch(`/api/orders/list`, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: CustomerOrder) => item.id,
  });

  let searchOrders = async () => {
    const txt = txtSearch.toLocaleLowerCase();
    const url = `/api/orders/search/${txt}`;
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
        orders.setSelectedKeys("all");
        orders.removeSelectedItems();
        orders.insert(0, ...data);
      })
      .catch((error) => {
        console.log(error);
      });
  }


  const closeForm = () => {
    if (selectedOrderId === 0) {
      orders.remove(0);
    }
    setSelectedOrderId(-1);
  };

  const updateOrder = (method: string, p: CustomerOrder) => {
    switch (method) {
      case "POST":
        {
          //orders.remove(0) 
          orders.update(0, p);
          setSelectedOrderId(p.id)
        }
        break;
      case "PUT":
        {
          orders.update(selectedOrderId, p);
        }
        break;
      case "DELETE":
        {
          orders.remove(selectedOrderId);
        }
        break;
    }
  };

  const updateTotal = (orderId: number, subtotal: number) => {
    let o = orders.getItem(orderId);
    let total = o.total + subtotal;
    let remain = total - o.payment;

    orders.update(orderId, { ...o, total: total, remainPayment: remain });
  };

  return (
    <Layout activeMenu={siteTitle}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <View marginBottom={"size-400"}>
        <span style={{ fontWeight: 700, fontSize: "24px" }}>
          Data {siteTitle}
        </span>
      </View>

      <Flex marginY={"size-250"} columnGap={"size-100"}>
        <View flex>
          <Button
            variant={"cta"}
            onPress={() => {
              if (!orders.getItem(0)) {
                orders.insert(0, initOrder);
              }
              setSelectedOrderId(0);
            }}
            marginBottom={"size-200"}
          >
            Penjualan Baru
          </Button>
        </View>
        <View>
          <Checkbox
            isSelected={isLunas}
            aria-label={"Show all orders"}
            onChange={(e) => {

              if (e != isLunas) {
                setIsLunas(!isLunas);
                reloadOrder(e);
              }
            }}
          >
            Show all stocks
          </Checkbox>
        </View>        <SearchField
          aria-label="Search orders"
          placeholder="e.g. kosim"
          width="auto"
          maxWidth="size-3600"
          value={txtSearch}
          onClear={() => orders.reload()}
          onChange={(e) => setTxtSearch(e)}
          onSubmit={() => searchOrders()}
        />
      </Flex>

      {products.isLoading || orders.isLoading || customers.isLoading && <WaitMe />}
      <Div isHeader isHidden>
        <Flex
          marginX={"size-100"}
          direction={{ base: "column", M: "row" }}
          columnGap="size-100"
        >
          <Flex flex direction={"row"} width={"60%"} columnGap={"size-50"}>
            <View width={"7%"}>ID#</View>
            <View flex>KETERANGAN</View>
            <View width={"17%"}>TANGGAL</View>
            <View width={"25%"}>NAMA PELANGGAN</View>
          </Flex>
          <Flex direction={"row"} width={{ base: "auto", M: "30%" }} columnGap={"size-50"}>
            <View width="33.3%">
              <span style={{ textAlign: "right", display: "block" }}>TOTAL</span>
            </View>
            <View width="33.3%">
              <span style={{ textAlign: "right", display: "block" }}>BAYAR</span>
            </View>
            <View width="33.3%">
              <span style={{ textAlign: "right", display: "block" }}>PIUTANG</span>
            </View>
          </Flex>
        </Flex>
      </Div>
      {orders &&
        orders.items.map(
          (x, i) => (
            <Div key={x.id} index={i} isSelected={selectedOrderId === x.id} selectedColor={"6px solid dodgerblue"} >
              {selectedOrderId === x.id ? (
                <OrderForm
                  customerList={customers}
                  data={x}
                  updateOrder={updateOrder}
                  closeForm={closeForm}
                >
                  <OrderDetail
                    isLunas={x.lunasId > 0}
                    products={products}
                    updateTotal={updateTotal}
                    orderId={x.id}
                  />
                </OrderForm>
              ) : (
                  <div key={x.id} style={{ color: selectedOrderId >= 0  ? '#bbb' : '#000'}}>
                <RenderCustomerOrder x={x} />
                  </div>
              )}
            </Div>
          )
        )}
      <Div isFooter>
        <Flex direction={"row"} marginX={"size-100"}>
          <View flex>Grand Total</View>
          <View>
            <Text>
              <strong>
                {FormatNumber(
                  orders.items.reduce((a, b) => a + b.remainPayment, 0)
                )}
              </strong>
            </Text>
          </View>
        </Flex>
      </Div>
    </Layout>
  );

  function RenderCustomerOrder({ x }: { x: CustomerOrder }) {
    return (
      <Fragment>
        <Flex
          marginX={"size-100"}
          direction={{ base: "column", M: "row" }}
          columnGap={"size-50"}
        >
          <Flex flex direction={"row"} width={{ base: "auto", M: "60%" }} columnGap={"size-50"}>
            <View width={"7%"}>{x.id}</View>
            <View flex>              
              <ActionButton
                flex
                height={"auto"}
                isQuiet
                onPress={() => {
                  setSelectedOrderId(x.id);
                }}
              >
                <span style={{ fontWeight: 700, color: selectedOrderId >= 0 ? "#bbb" : "#333" }}>
                  {x.id === 0 ? "Piutang Baru" : x.descriptions}
                </span>
              </ActionButton>
            </View>
            <View width={{ base: "50%", M: "17%" }}>{FormatDate(x.orderDate)}</View>
            <View width={{ base: "50%", M: "25%" }}><Link 
            href={'/customer/[id]'}
            as={`/customer/${x.customerId}`}
              passHref><a style={{ color: selectedOrderId >= 0 ? "#bbb" : "#000" }}>{x.name}</a></Link></View>
          </Flex>
          <Flex direction={"row"} width={{ base: "auto", M: "30%" }} columnGap={"size-50"}>
            <Span width={"33.3%"} isNumber >{FormatNumber(x.total)}</Span>
            <Span width={"33.3%"} isNumber >{FormatNumber(x.payment)}</Span>
            <Span width={"33.3%"} isNumber isTotal>{FormatNumber(x.remainPayment)}</Span>
          </Flex>
        </Flex>
      </Fragment>
    );
  }

  async function reloadOrder(all: boolean) {
    setIsReload(true);

    const url = `/api/orders/list/?ls=${all ? 1 : 0}`;
    const fetchOptions = {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      orders.setSelectedKeys("all");
      orders.removeSelectedItems();
      orders.append(...json);
    } else {
      console.log(json.message);
      alert("Data tidak ditemukan.");
    }

    setIsReload(false);
  }
};

export default OrderComponent;

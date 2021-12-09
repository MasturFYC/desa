import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { AsyncListData, useAsyncList } from "@react-stately/data";
import { View } from "@react-spectrum/view";
import { SearchField } from "@react-spectrum/searchfield";
import { Button } from "@react-spectrum/button";
import { Flex } from "@react-spectrum/layout";
import { FormatDate, FormatNumber } from "@lib/format";
import { dateParam, iCustomer, iProduct } from "@components/interfaces";
import Layout from "@components/layout";
import WaitMe from "@components/ui/wait-me";
import { CustomerSpecialOrder } from "./form";
import SpanLink from "@components/ui/span-link";
import { Checkbox } from "@react-spectrum/checkbox";

const siteTitle = "Penjualan (Khusus)";

const SpecialDetail = dynamic(() => import("./order-detail/index"), {
  ssr: false,
});

const SpecialOrderForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initOrder: CustomerSpecialOrder = {
  id: 0,
  customerId: 0,
  suratJalan: "",
  lunasId: 0,
  createdAt: dateParam(null),
  packagedAt: dateParam(null),
  shippedAt: dateParam(null),
  driverName: "",
  policeNumber: "",
  street: "",
  city: "",
  phone: "",
  total: 0,
  cash: 0,
  name: "",
  payments: 0,
  remainPayment: 0,
  descriptions: "",
};

const SpecialOrderComponent: NextPage = () => {
  let [txtSearch, setTxtSearch] = useState<string>("");
  let [txt, setTxt] = useState<string>("");
  let [selectedOrderId, setSelectedOrderId] = useState<number>(-1);
  let [isShowAll, setIsShowAll] = useState<boolean>(false);
  let [isReload, setIsReload] = useState<boolean>(false);

  let products = useAsyncList<iProduct>({
    async load({ signal }) {
      let res = await fetch(`/api/category/2`, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iProduct) => item.id,
  });

  let customers = useAsyncList<iCustomer>({
    async load({ signal }) {
      let res = await fetch(`/api/customer/special`, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iCustomer) => item.id,
  });

  let orders = useAsyncList<CustomerSpecialOrder>({
    async load({ signal }) {
      let res = await fetch(`/api/special-order/list/`, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: CustomerSpecialOrder) => item.id,
  });

  async function reloadOrder(all: boolean) {
    setIsReload(true);

    const url = `/api/special-order/list/?all=${all}`;
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

  const closeForm = () => {
    if (selectedOrderId === 0) {
      orders.remove(0);
    }
    setSelectedOrderId(-1);
  };

  const updateOrder = (method: string, p: CustomerSpecialOrder) => {
    switch (method) {
      case "POST":
        {
          //orders.remove(0)
          orders.update(0, p);
          setSelectedOrderId(p.id);
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
    let remain = total - o.payments;

    orders.update(orderId, { ...o, total: total, remainPayment: remain });
  };

  function getFilteredData(f?: string) {
    if (f) {
      return orders.items.filter(
        (o) =>
          o.driverName.toLocaleLowerCase().includes(f.toLocaleLowerCase()) ||
          o.name?.toLocaleLowerCase().includes(f.toLocaleLowerCase()) ||
          o.street.toLocaleLowerCase().includes(f.toLocaleLowerCase()) ||
          o.city.toLocaleLowerCase().includes(f.toLocaleLowerCase())
      );
    }
    return orders.items;
  }

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
            isSelected={isShowAll}
            aria-label={"Show all orders"}
            onChange={(e) => {
              setIsShowAll(!isShowAll);
              reloadOrder(e);
            }}
          >
            Show all orders
          </Checkbox>
        </View>
        <SearchField
          aria-label="Search orders"
          placeholder="e.g. kosim"
          width="auto"
          maxWidth="size-3600"
          value={txt}
          onClear={() => {
            setTxt("");
            setTxtSearch("");
          }}
          onChange={(e) => setTxt(e)}
          onSubmit={(e) => setTxtSearch(e)}
        />
      </Flex>

      {products.isLoading ||
        orders.isLoading ||
        customers.isLoading ||
        (isReload && <WaitMe />)}
      {orders &&
        getFilteredData(txtSearch).map((x, i) => (
          <View
            key={x.id}
            padding={"size-100"}
            marginTop={"size-100"}
            backgroundColor={
              selectedOrderId === x.id
                ? "gray-200"
                : i % 2 === 0
                ? "gray-100"
                : "gray-50"
            }
            borderRadius={selectedOrderId === x.id ? "large" : "medium"}
            borderWidth={selectedOrderId === x.id ? "thick" : "thin"}
            borderStartWidth={selectedOrderId === x.id ? "thickest" : "thin"}
            borderColor={"indigo-400"}
            //borderBottomWidth={"thin"}
            //borderColor={selectedOrderId === x.id ? "indigo-400" : "transparent"}
            // borderStartColor={selectedOrderId === x.id ? "indigo-400" : "transparent"}
          >
            {selectedOrderId === x.id ? (
              <SpecialOrderForm
                customerList={customers}
                data={x}
                updateOrder={updateOrder}
                closeForm={closeForm}
              >
                <SpecialDetail
                  products={products}
                  updateTotal={updateTotal}
                  orderId={x.id}
                />
              </SpecialOrderForm>
            ) : (
              <RenderOrder x={x} customer={customers.getItem(x.customerId)}>
                <SpanLink onClick={() => setSelectedOrderId(x.id)}>
                  <span style={{ textAlign: "left" }}>ORDER ID#: {x.id}</span>
                  <br />
                </SpanLink>
              </RenderOrder>
            )}
          </View>
        ))}

      <RenderSummary orders={orders} />
    </Layout>
  );
};

type RenderOrderProps = {
  x: CustomerSpecialOrder;
  customer: iCustomer;
  children: JSX.Element;
};

type RenderSummaryProps = {
  orders: AsyncListData<CustomerSpecialOrder>;
};

function RenderSummary(props: RenderSummaryProps) {
  let { orders } = props;

  return (
    <View marginY={"size-200"}>
      <div
        style={{
          fontWeight: 700,
          fontSize: "16px",
          fontStyle: "italic",
          marginBottom: "12px",
        }}
      >
        Summary:
      </div>
      <table style={{ borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ paddingRight: "12px" }}>Total Order</td>
            <td style={{ fontWeight: 700, textAlign: "right" }}>
              {FormatNumber(orders.items.reduce((a, b) => a + b.total, 0))}
            </td>
          </tr>
          <tr>
            <td style={{ paddingRight: "12px" }}>Total Cash</td>
            <td style={{ fontWeight: 700, textAlign: "right" }}>
              {FormatNumber(orders.items.reduce((a, b) => a + b.cash, 0))}
            </td>
          </tr>
          <tr>
            <td style={{ paddingRight: "12px" }}>Total Angsuran</td>
            <td style={{ fontWeight: 700, textAlign: "right" }}>
              {FormatNumber(orders.items.reduce((a, b) => a + b.payments, 0))}
            </td>
          </tr>
          <tr>
            <td style={{ paddingRight: "12px" }}>Total Piutang</td>
            <td style={{ fontWeight: 700, textAlign: "right" }}>
              {FormatNumber(
                orders.items.reduce((a, b) => a + b.remainPayment, 0)
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </View>
  );
}

function RenderOrder(props: RenderOrderProps) {
  let { x, children, customer } = props;
  return (
    <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
      <View flex>
        <View>{children}</View>
        <View>
          <span style={{ fontWeight: 700 }}>Tanggal Order</span>:{" "}
          {FormatDate(x.createdAt)}
        </View>
        <View>
          <span style={{ fontWeight: 700 }}>Tanggal Pengepakan</span>:{" "}
          {FormatDate(x.packagedAt)}
        </View>
        <View>
          <span style={{ fontWeight: 700 }}>Total</span>:{" "}
          {FormatNumber(x.total)}
        </View>
        <View>
          <span style={{ fontWeight: 700 }}>Panjer / Cash</span>:{" "}
          {FormatNumber(x.cash)}
        </View>
        <View>
          <span style={{ fontWeight: 700 }}>Angsuran</span>:{" "}
          {FormatNumber(x.payments)}
        </View>
        <View>
          <span style={{ fontWeight: 700 }}>Piutang</span>:{" "}
          {FormatNumber(x.remainPayment)}
        </View>
        <View>
          <b>Supir</b>: {x.driverName} / <b>Mobil</b>: {x.policeNumber}
        </View>
      </View>
      {customer && (
        <View flex>
          <div style={{ marginBottom: "6px", fontWeight: 700 }}>
            Informasi Pembeli
          </div>
          <div>
            <Link
              href={"special-customer/[id]"}
              as={`/special-customer/${customer.id}`}
              passHref
            >
              <a>{customer.name}</a>
            </Link>
            <br />
            {customer.street} - {customer.city},
            <br />
            Telp. {customer.phone}
          </div>
          <div style={{ marginTop: "6px" }}>
            <span style={{ fontWeight: 700 }}>Keterangan</span>:{" "}
            {x.descriptions || ""}
          </div>
        </View>
      )}
      <View flex>
        <div style={{ marginBottom: "6px" }}>
          <b>Informasi Pengiriman</b>
          <br />
        </div>
        <div>
          <span style={{ fontWeight: 700 }}>Surat Jalan</span>: {x.suratJalan}
          <br />
          <span style={{ fontWeight: 700 }}>Supir</span>: {x.driverName} /{" "}
          <b>Mobil</b>: {x.policeNumber}
          <br />
          <span style={{ fontWeight: 700 }}>Tgl. Pengiriman</span>:{" "}
          {FormatDate(x.shippedAt)}
        </div>
        <div style={{ marginTop: "12px" }}>
          <span style={{ fontWeight: 700 }}>Alamat Pengiriman</span>
          <br />
          {x.street} - {x.city}, Telp. {x.phone}
        </div>
      </View>
    </Flex>
  );
}

export default SpecialOrderComponent;

import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { AsyncListData, useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { NextPage } from "next";
import {
  dateParam,
  iSpecialOrder,
  iProduct,
  iCustomer,
} from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";
import SpanLink from "@components/ui/span-link";

const SpecialOrderDetail = dynamic(
  () => import("@components/special-order/order-detail"),
  {
    loading: () => <WaitMe />,
    ssr: false,
  }
);

const SpecialOrderForm = dynamic(() => import("./form"), {
  ssr: false,
});

const initOrder: iSpecialOrder = {
  id: 0,
  customerId: 0,
  createdAt: dateParam(null),
  packagedAt: dateParam(null),
  shippedAt: dateParam(null),
  driverName: '',
  policeNumber: '',
  street: '',
  city: '',
  phone: '',
  total: 0,
  cash: 0,
  payments: 0,
  remainPayment: 0,
  descriptions: ''
};

type PiutangDagangProps = {
  customer: iCustomer;
};

const SpecialOrderComponent: NextPage<PiutangDagangProps> = (props) => {
  let { customer } = props;
  let [selectedOrderId, setSelectedOrderId] = useState<number>(-1);

  let products = useAsyncList<iProduct>({
    async load({ signal }) {
      let res = await fetch(`/api/category/2`, {
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

  let orders = useAsyncList<iSpecialOrder>({
    async load({ signal }) {
      let res = await fetch(`/api/special-order/customer/${customer.id}`, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iSpecialOrder) => item.id,
  });

  const closeForm = () => {
    if (selectedOrderId === 0) {
      orders.remove(0);
    }
    setSelectedOrderId(-1);
  };

  const updateOrder = (method: string, p: iSpecialOrder) => {
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
    let remain = total - o.payments;

    orders.update(orderId, { ...o, total: total, remainPayment: remain });
  };

  return (
    <View>
      <Flex marginY={"size-250"} columnGap={"size-100"}>
        <View flex>
          <Button
            variant={"cta"}
            onPress={() => {
              if (!orders.getItem(0)) {
                orders.insert(0, {
                  ...initOrder,
                  customerId: customer.id,
                  street: customer.street || '',
                  city: customer.city || '',
                  phone: customer.phone || ''
                });
              }
              setSelectedOrderId(0);
            }}
            marginBottom={"size-200"}
          >
            Penjualan Baru
          </Button>
        </View>

      </Flex>
      {products.isLoading || orders.isLoading && <WaitMe />}
      {orders &&
        orders.items.map(
          (x, i) => (
            <View
              key={x.id}
              padding={"size-100"}
              marginTop={"size-100"}
              backgroundColor={selectedOrderId === x.id ? "gray-200" : (i % 2 === 0 ? "gray-100" : "gray-50")}
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
                  data={x}
                  customer={customer}
                  updateOrder={updateOrder}
                  closeForm={closeForm}
                >
                  <SpecialOrderDetail
                    products={products}
                    updateTotal={updateTotal}
                    orderId={x.id}
                  />
                </SpecialOrderForm>
              ) : (
                <RenderOrder x={x} customer={customer}>
                  <View>
                    <SpanLink onClick={() => setSelectedOrderId(x.id)}>
                      <span style={{ textAlign: "left" }}>ORDER ID#: {x.id}</span><br />
                    </SpanLink>
                  </View>
                </RenderOrder>
              )}
            </View>
          )
        )}

      <RenderSummary orders={orders} />
    </View>
  );
};

type RenderOrderProps = {
  x: iSpecialOrder,
  customer: iCustomer,
  children: JSX.Element
}

type RenderSummaryProps = {
  orders: AsyncListData<iSpecialOrder>
}

function RenderSummary(props: RenderSummaryProps) {
  let { orders } = props;

  return <View marginY={"size-200"}>
    <div style={{ fontWeight: 700, fontSize: "16px", fontStyle: "italic", marginBottom: "12px" }}>Summary:</div>
    <table style={{ borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td style={{ paddingRight: "12px" }}>Total Order</td>
          <td style={{ fontWeight: 700, textAlign: "right" }}>{FormatNumber(orders.items.reduce((a, b) => a + b.total, 0))}</td>
        </tr>
        <tr>
          <td style={{ paddingRight: "12px" }}>Total Cash</td>
          <td style={{ fontWeight: 700, textAlign: "right" }}>{FormatNumber(orders.items.reduce((a, b) => a + b.cash, 0))}</td>
        </tr>
        <tr>
          <td style={{ paddingRight: "12px" }}>Total Angsuran</td>
          <td style={{ fontWeight: 700, textAlign: "right" }}>{FormatNumber(orders.items.reduce((a, b) => a + b.payments, 0))}</td>
        </tr>
        <tr>
          <td style={{ paddingRight: "12px" }}>Total Piutang</td>
          <td style={{ fontWeight: 700, textAlign: "right" }}>{FormatNumber(orders.items.reduce((a, b) => a + b.remainPayment, 0))}</td>
        </tr>
      </tbody>
    </table>
  </View>;
}

function RenderOrder(props: RenderOrderProps) {
  let { x, children, customer } = props;
  return (
    <Flex
      direction={{ base: "column", M: "row" }}
      columnGap={"size-200"}
    >
      <View flex>
        <View>{children}</View>
        <View><span style={{ fontWeight: 700 }}>Tanggal Order</span>: {FormatDate(x.createdAt)}</View>
        <View><span style={{ fontWeight: 700 }}>Total</span>: {FormatNumber(x.total)}</View>
        <View><span style={{ fontWeight: 700 }}>Panjer / Cash</span>: {FormatNumber(x.cash)}</View>
        <View><span style={{ fontWeight: 700 }}>Angsuran</span>: {FormatNumber(x.payments)}</View>
        <View><span style={{ fontWeight: 700 }}>Piutang</span>: {FormatNumber(x.remainPayment)}</View>
        <View><b>Supir</b>: {x.driverName} / <b>Mobil</b>: {x.policeNumber}</View>
      </View>
      <View flex>
        <div style={{ marginBottom: "6px", fontWeight: 700 }}>Informasi Pembeli</div>
        <div>
          {customer.name}<br />
          {customer.street} - {customer.city},
          <br />
          Telp. {customer.phone}
        </div>
        <div style={{ marginTop: "6px" }}><span style={{ fontWeight: 700 }}>Keterangan</span>: {x.descriptions || ''}</div>
      </View>
      <View flex>
        <div style={{ marginBottom: "6px" }}>
          <b>Informasi Pengiriman</b><br />
        </div>
        <div>
          <span style={{ fontWeight: 700 }}>Tgl. Pengepakan</span>: {FormatDate(x.packagedAt)}<br />
          <span style={{ fontWeight: 700 }}>Tgl. Pengiriman</span>: {FormatDate(x.shippedAt)}
        </div>
        <div style={{ marginTop: "12px" }}>
          <span style={{ fontWeight: 700 }}>Alamat Pengiriman</span><br />
          {x.street} - {x.city},
          Telp. {x.phone}
        </div>
      </View>
    </Flex>
  );
}

export default SpecialOrderComponent;
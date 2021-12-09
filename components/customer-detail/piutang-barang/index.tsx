import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import { ActionButton, Button, ToggleButton } from '@react-spectrum/button';
import { Flex } from '@react-spectrum/layout';
import { Text } from '@react-spectrum/text';

import {
  dateParam,
  iOrder,
  iProduct,
} from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";
import Pin from "@spectrum-icons/workflow/PinOff";
import Div from "@components/ui/Div";

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

const initOrder: iOrder = {
  id: 0,
  lunasId: 0,
  customerId: 0,
  orderDate: dateParam(null),
  total: 0,
  payment: 0,
  remainPayment: 0,
  descriptions: "Pembelian Barang",
};

type PiutangBarangProps = {
  customerId: number;
};

const PiutangBarang: NextPage<PiutangBarangProps> = ({ customerId }) => {
  let [showDetail, setShowDetail] = useState<boolean>(false);
  let [selectedOrderId, setSelectedOrderId] = useState<number>(-1);
 // let [detailId, setDetailId] = useState<number>(0);

  let products = useAsyncList<iProduct>({
    async load({ signal }) {
      let res = await fetch(`/api/product/list`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iProduct) => item.id,
  });

  let orders = useAsyncList<iOrder>({
    async load({ signal }) {
      let res = await fetch(`/api/customer/order/${customerId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iOrder) => item.id,
  });

  const closeForm = () => {
    if(selectedOrderId === 0) {
      orders.remove(0);
    }
    setSelectedOrderId(-1);
  };

  const updateOrder = (method: string, p: iOrder) => {
    switch (method) {
      case "POST":
        {
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
    <Fragment>
      <Button
        variant={"cta"}
        onPress={() => {
          if(!orders.getItem(0)) {
            orders.insert(0, {...initOrder, customerId: customerId});
          }
          setSelectedOrderId(0);
        }}
        marginBottom={"size-200"}
      >
        Piutang Baru
      </Button>
      <Div isHeader isHidden>
        <Flex
          isHidden={{ base: true, M: false }}
          marginX={"size-100"}
          direction={{ base: "column", M: "row" }}
          columnGap="size-100"
        >
          <View width={"5%"}>ID#</View>
          <View flex>Keterangan</View>
          <View width={"20%"}>Tanggal</View>
          <View width="10%">
            <span style={{ textAlign: "right", display: "block" }}>Total</span>
          </View>
          <View width="10%">
            <span style={{ textAlign: "right", display: "block" }}>Bayar</span>
          </View>
          <View width="10%">
            <span style={{ textAlign: "right", display: "block" }}>Piutang</span>
          </View>
        </Flex>
      </Div>
      {products.isLoading || (orders.isLoading && <WaitMe />)}
      {orders &&
        orders.items.map(
          (x, i) => (
            <Div key={x.id} index={i} isSelected={selectedOrderId === x.id} selectedColor={"6px solid dodgerblue"} >
              {selectedOrderId === x.id ? (
                <OrderForm
                  data={x}
                  updateOrder={updateOrder}
                  closeForm={closeForm}
                >
                  <OrderDetail
                    products={products}
                    updateTotal={updateTotal}
                    orderId={x.id}
                  />
                  </OrderForm>
              ) : (
                renderPiutang({ x })
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
    </Fragment>
  );

  function renderPiutang({ x }: { x: iOrder }) {
    return (
      <Fragment>
        <Flex          
          marginX={"size-100"}
          direction={"row"}
          //direction={{base:"column", M:"row"}}
          columnGap="size-100"
          wrap={"wrap"}
        >
          <View width={"5%"}>{x.id}</View>
          <View flex={{ base: "50%", M: 1 }}>
            <ActionButton
              flex
              height={"auto"}
              isQuiet
              onPress={() => {
                setSelectedOrderId(x.id);
              }}
            >
              <span style={{ fontWeight: 700 }}>
                {x.id === 0 ? "Piutang Baru" : x.descriptions}
              </span>
            </ActionButton>
            {/* {x.id > 0 && (
              <ToggleDetail
                isSelected={detailId === x.id && showDetail}
                showOrderDetail={(e) => {
                  setDetailId(x.id);
                  setShowDetail(e);
                }}
              />
            )} */}
          </View>
          {x.id > 0 && renderDetail(x)}
        </Flex>
        {/* {detailId === x.id && showDetail && ( */}
          {/* <OrderDetail
            products={products}
            updateTotal={updateTotal}
            orderId={x.id}
          /> */}
        {/* )} */}
      </Fragment>
    );
  }

  function renderDetail(x: iOrder): React.ReactNode {
    return (
      <>
        <View width={{ base: "50%", M: "20%" }}>{FormatDate(x.orderDate)}</View>
        <View width={"10%"} isHidden={{ base: true, M: false }}>
          <span style={{ textAlign: "right", display: "block" }}>
            {FormatNumber(x.total)}
          </span>
        </View>
        <View width={"10%"} isHidden={{ base: true, M: false }}>
          <span style={{ textAlign: "right", display: "block" }}>
            {FormatNumber(x.payment)}
          </span>
        </View>
        <View width={{ base: "47%", M: "10%" }}>
          <span
            style={{ textAlign: "right", display: "block", fontWeight: 700 }}
          >
            {FormatNumber(x.remainPayment)}
          </span>
        </View>
      </>
    );
  }
};

export default PiutangBarang;

type ToggleDetailProps = {
  isSelected: boolean;
  showOrderDetail: (isShow: boolean) => void;
};

function ToggleDetail({ isSelected, showOrderDetail }: ToggleDetailProps) {
  // let [isShow, setIsShow] = useState<boolean>(isSelected);

  return (
    <ToggleButton
      flex
      height={"auto"}
      marginStart={"size-200"}
      isEmphasized
      isSelected={isSelected}
      onChange={(e) => {
        //        setIsShow(e);
        showOrderDetail(e);
      }}
      isQuiet
    >
      <Pin aria-label="Pin" />
      <Text>Details</Text>
    </ToggleButton>
  );
}

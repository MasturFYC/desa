import dynamic from "next/dynamic";
import React, { useState } from "react";
import { useAsyncList, AsyncListData } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import { ActionButton } from "@react-spectrum/button";
import { Divider } from "@react-spectrum/divider";
import { Flex } from "@react-spectrum/layout";
import PinAdd from "@spectrum-icons/workflow/Add";
import { env } from 'process';

import { iOrderDetail, iOrder, iProduct } from "@components/interfaces";
import { FormatNumber } from "@lib/format";
import Div from "@components/ui/Div";

const OrderDetailForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initOrderDetail: iOrderDetail = {
  orderId: 0,
  id: 0,
  unitId: 0,
  productId: 0,
  qty: 1,
  content: 0,
  unitName: "",
  realQty: 0,
  price: 0,
  discount: 0,
  buyPrice: 0,
  subtotal: 0,
};

type OrderDetailProps = {
  isLunas?: boolean,
  products: AsyncListData<iProduct>;
  orderId: number;
  updateTotal: (orderId: number, subtotal: number) => void;
};

const OrderDetail: NextPage<OrderDetailProps> = ({
  isLunas,
  products,
  orderId,
  updateTotal,
}) => {
  let [selectedDetailId, setSelectedDetailId] = useState<number>(-1);
  let [detail, setDetail] = useState<iOrderDetail>(initOrderDetail);
  let [isNew, setIsNew] = useState<boolean>(false);

  let orderDetails = useAsyncList<iOrderDetail>({
    async load({ signal }) {
      let res = await fetch(`${env.apiKey}/order-detail/${orderId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iOrderDetail) => item.id,
  });

  const closeForm = () => {
    setSelectedDetailId(-1);
    if (isNew) {
      setIsNew(false);
    }
  };

  const updateOrderDetail = (method: string, p: iOrderDetail) => {
    switch (method) {
      case "POST":
        {
          orderDetails.append(p);
          updateTotal(p.orderId, p.qty * (p.price - p.discount));
        }
        break;
      case "PUT":
        {
          orderDetails.update(p.id, p);
          updateTotal(p.orderId, (p.qty * (p.price - p.discount)) - detail.subtotal);
        }
        break;
      case "DELETE":
        {
          orderDetails.remove(p.id);
          updateTotal(p.orderId, -detail.subtotal);
        }
        break;
    }
  };

  return (
      <View>
        <Div isHeader>
          <Flex
            isHidden={{ base: true, M: false }}
            marginX={"size-100"}
            direction={{ base: "column", M: "row" }}
            columnGap="size-100"
          >
            <View width="5%">ID#</View>
            <View flex>NAMA BARANG</View>
            <View width={"20%"}>QTY/UNIT</View>
            <View width="10%">
              <span style={{ textAlign: "right", display: "block" }}>HARGA</span>
            </View>
            <View width="10%">
              <span style={{ textAlign: "right", display: "block" }}>DISCOUNT</span>
            </View>
            <View width="10%">
              <span style={{ textAlign: "right", display: "block" }}>SUBTOTAL</span>
            </View>
          </Flex>
          <Divider size={"S"} />
        </Div>
        {orderDetails.isLoading && <WaitMe />}
        {orderDetails &&
          [...orderDetails.items, { ...initOrderDetail, orderId: orderId }].map(
            (x, i) => (
              <Div
                isSelected={selectedDetailId === x.id}
                selectedColor={'6px solid green'}
                key={x.id}
              >
                {renderDetails(x, isNew)}
                {selectedDetailId === x.id && (

                  <OrderDetailForm
                    isLunas={isLunas}
                    products={products}
                    data={x}
                    updateDetail={updateOrderDetail}
                    closeForm={closeForm}
                  />
                )}
              </Div>
            )
          )}
      </View>
  );

  function renderDetails(x: iOrderDetail, isNew: boolean) {
    return (
      <Flex
        marginX={"size-100"}
        direction={"row"}
        //direction={{base:"column", M:"row"}}
        columnGap="size-100"
        wrap={"wrap"}
      >
        {x.id > 0 && <View width={"5%"}>{x.id}</View>}
        <View flex={{ base: "50%", M: 1 }}>
          {isLunas ? <span>{x.productName}</span> :
          <ActionButton
            flex
            height={"auto"}
            isQuiet
            onPress={() => {
              setSelectedDetailId(selectedDetailId === x.id ? -1 : x.id);
              setDetail(x);
            }}
          >
            {x.id === 0 ? (
              <>
                <PinAdd size="S" />
                Add Item
              </>
            ) : (
              <span style={{ fontWeight: 700 }}>
                {x.productName} - {x.spec}
              </span>
            )}
          </ActionButton>}
        </View>
        {x.id > 0 && renderDetail(x)}
      </Flex>
    );
  }

  function renderDetail(x: iOrderDetail): React.ReactNode {
    return (
      <>
        <View width={{ base: "50%", M: "20%" }}>
          {FormatNumber(x.qty)} {x.unitName}
        </View>
        <View width={"10%"} isHidden={{ base: true, M: false }}>
          <span style={{ textAlign: "right", display: "block" }}>
            {FormatNumber(x.price)}
          </span>
        </View>
        <View width={"10%"} isHidden={{ base: true, M: false }}>
          <span style={{ textAlign: "right", display: "block" }}>
            {FormatNumber(x.discount)}
          </span>
        </View>
        <View width={{ base: "47%", M: "10%" }}>
          <span
            style={{ textAlign: "right", display: "block", fontWeight: 700 }}
          >
            {FormatNumber(x.subtotal)}
          </span>
        </View>
      </>
    );
  }
};

export default OrderDetail;

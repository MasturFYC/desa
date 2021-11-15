import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import {
  ActionButton,
  Button,
  Divider,
  Flex,
  Text
} from "@adobe/react-spectrum";
import { dateParam, iOrderDetail, iOrder } from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";

const OrderDetailForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initOrderDetail: iOrderDetail = {
  orderId: 0,
  id: 0,
  unitId: 0,
  productId: 0,
  qty: 0,
  content: 0,
  unitName: '',
  realQty: 0,
  price: 0,
  buyPrice: 0,
  subtotal: 0
};

type OrderDetailProps = {
  orderId: number;
  order: iOrder;
  updateOrder: (method: string, p: iOrder) => void
};

const OrderDetail: NextPage<OrderDetailProps> = ({ orderId, order, updateOrder }) => {
  let [selectedDetailId, setSelectedDetailId] = useState<number>(-1);
  let [detail, setDetail] = useState<iOrderDetail>(initOrderDetail);
  let [isNew, setIsNew] = useState<boolean>(false);

  let orderDetails = useAsyncList<iOrderDetail>({
    async load({ signal }) {
      let res = await fetch(`/api/order-detail/${orderId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iOrderDetail) => item.id,
  });

  const closeForm = () => {
    setSelectedDetailId(-1);
    if(isNew) {
      setIsNew(false)
    }
  };

  const updateOrderDetail = (method: string, p: iOrderDetail) => {
    switch (method) {
      case "POST":
        {
          orderDetails.insert(0, p);
          updateOrder('PUT', {...order,
            total: order.total + p.subtotal
          })
        }
        break;
      case "PUT":
        {
          orderDetails.update(selectedDetailId, p);
          updateOrder('PUT', {...order,
            total: order.total + (p.subtotal - detail.subtotal)
          })
        }
        break;
      case "DELETE":
        {
          orderDetails.remove(selectedDetailId);
          updateOrder('PUT', {...order,
            total: order.total - detail.subtotal
          })
        }
        break;
    }
  };

  return (
    <Fragment>
      <Divider size="S" />
      <Flex
        isHidden={{base: true, M: false}}
        marginBottom={"size-100"}
        direction={{ base: "column", M: "row" }}
        columnGap="size-100"
      >
        <View flex>Nama Barang</View>
        <View width={"20%"}>Qty</View>
        <View width="10%"><span style={{textAlign: "right", display: "block"}}>Harga</span></View>
        <View width="10%"><span style={{textAlign: "right", display: "block"}}>Subtotal</span></View>
      </Flex>
      <Divider size={"S"} />
      {orderDetails.isLoading && <WaitMe />}
      {orderDetails &&
        [{ ...initOrderDetail, orderId: orderId }, ...orderDetails.items].map(
          (x, i) => (
            <View
              key={x.id}
              borderStartColor={
                selectedDetailId === x.id ? "orange-500" : "transparent"
              }
              //paddingStart={selectedOrderId === x.id ? "size-100" : 0}
              borderStartWidth={selectedDetailId === x.id ? "thickest" : "thin"}
              //marginY={"size-125"}
            >
              {selectedDetailId === x.id ? (
                <OrderDetailForm
                  data={x}
                  updateDetail={updateOrderDetail}
                  closeForm={closeForm}
                />
              ) : (
                renderPiutang(x, isNew)
              )}
            </View>
          )
        )}
      <div style={{ marginBottom: "24px" }} />
    </Fragment>
  );

  function renderPiutang(x: iOrderDetail, isNew: boolean) {
    return (
      <Fragment>
        <Flex
          marginY={"size-75"}
          direction={"row"}
          //direction={{base:"column", M:"row"}}
          columnGap="size-100"
          wrap={"wrap"}
        >
          <View flex={{base: "50%", M: 1}}>
            <ActionButton
              flex
              height={"auto"}
              isQuiet
              onPress={() => {
                setSelectedDetailId(selectedDetailId === x.id ? -1 : x.id);
              }}
            >
              <span style={{ fontWeight: 700 }}>
                {x.id === 0 ? "Tambah item" : `${x.productName} - ${x.spec}` }
              </span>
            </ActionButton>
          </View>
          {x.id > 0 && renderDetail(x)}
        </Flex>
        {x.id > 0 && <Divider size={"S"} />}
      </Fragment>
    );
  }

  function renderDetail(x: iOrderDetail): React.ReactNode {
    return (
      <>
        <View width={{base:"50%",M:"20%"}}>{FormatNumber(x.qty)}</View>
        <View width={"10%"} isHidden={{base: true, M: false}}><span style={{textAlign: "right", display: "block"}}>{FormatNumber(x.price)}</span></View>
        <View width={{base:"47%",M:"10%"}}><span style={{textAlign: "right", display: "block", fontWeight: 700}}>{FormatNumber(x.subtotal)}</span></View>
      </>
    );
  }
};

export default OrderDetail;

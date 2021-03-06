import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList, AsyncListData } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import { ActionButton} from "@react-spectrum/button";
import { Divider } from "@react-spectrum/divider";
import { Flex } from "@react-spectrum/layout";
import PinAdd from "@spectrum-icons/workflow/Add";


import { iSpecialDetail, iSpecialOrder, iProduct } from "@components/interfaces";
import { FormatNumber } from "@lib/format";
import Div from "@components/ui/Div";

const OrderDetailForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initOrderDetail: iSpecialDetail = {
  orderId: 0,
  id: 0,
  unitId: 0,
  productId: 0,
  discount: 0,
  qty: 1,
  content: 0,
  unitName: "",
  realQty: 0,
  price: 0,
  buyPrice: 0,
  subtotal: 0,
};

type SpecialDetailProps = {
  products: AsyncListData<iProduct>;
  orderId: number;
  updateTotal: (orderId: number, subtotal: number) => void;
};

const SpecialDetail: NextPage<SpecialDetailProps> = ({
  products,
  orderId,
  updateTotal,
}) => {
  let [selectedDetailId, setSelectedDetailId] = useState<number>(-1);
  let [detail, setDetail] = useState<iSpecialDetail>(initOrderDetail);
  let [isNew, setIsNew] = useState<boolean>(false);

  let orderDetails = useAsyncList<iSpecialDetail>({
    async load({ signal }) {
      let res = await fetch(`${process.env.apiKey}/special-detail/${orderId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iSpecialDetail) => item.id,
  });

  const closeForm = () => {
    setSelectedDetailId(-1);
    if (isNew) {
      setIsNew(false);
    }
  };

  const updateOrderDetail = (method: string, p: iSpecialDetail) => {
    switch (method) {
      case "POST":
        {
          orderDetails.append(p);
          updateTotal(p.orderId, p.qty * p.price);
        }
        break;
      case "PUT":
        {
          orderDetails.update(p.id, p);
          updateTotal(p.orderId, p.qty * p.price - detail.subtotal);
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
    <Fragment>
      <View>
        <Div isHeader>
          <Flex
            isHidden={{ base: true, M: false }}
            marginX={"size-100"}
            direction={{ base: "column", M: "row" }}
            columnGap="size-100"
          >
            <View width="5%">ID#</View>
            <View flex>Nama Barang</View>
            <View width={"20%"}>Qty / Unit</View>
            <View width="10%">
              <span style={{ textAlign: "right", display: "block" }}>Harga</span>
            </View>
            <View width="10%">
              <span style={{ textAlign: "right", display: "block" }}>Subtotal</span>
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
                {selectedDetailId === x.id ? (

                  <OrderDetailForm
                    products={products}
                    data={x}
                    updateDetail={updateOrderDetail}
                    closeForm={closeForm}
                  />
                ): renderDetails(x, isNew)}
              </Div>
            )
          )}
      </View>
    </Fragment>
  );

  function renderDetails(x: iSpecialDetail, isNew: boolean) {
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
          <ActionButton
            isDisabled={orderId === 0}
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
                {x.productName}, {x.spec}
              </span>
            )}
          </ActionButton>
        </View>
        {x.id > 0 && renderTotal(x)}
      </Flex>
    );
  }

  function renderTotal(x: iSpecialDetail): React.ReactNode {
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

export default SpecialDetail;

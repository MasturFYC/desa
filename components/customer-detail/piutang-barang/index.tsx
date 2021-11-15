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
  Text,
  ToggleButton,
} from "@adobe/react-spectrum";
import { dateParam, iOrder, iOrderDetail } from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";
import Pin from "@spectrum-icons/workflow/PinOff";

const OrderDetail = dynamic(() => import("@components/customer-detail/piutang-barang/order-detail"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const OrderForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initOrder: iOrder = {
  id: 0,
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
  let [detailId, setDetailId] = useState<number>(0);
  let [isNew, setIsNew] = useState<boolean>(false);

  let orders = useAsyncList<iOrder>({
    async load({ signal }) {
      let res = await fetch(`/api/customer/order/${customerId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iOrder) => item.id,
  });

  const closeForm = () => {
    setSelectedOrderId(-1);
    if (isNew) {
      setIsNew(false);
    }
  };

  const updateOrder = (method: string, p: iOrder) => {
    switch (method) {
      case "POST":
        {
          orders.insert(0, p);
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

  return (
    <Fragment>
      {orders.isLoading && <WaitMe />}
      <Button
        variant={"cta"}
        onPress={() => {
          setSelectedOrderId(isNew ? -1 : 0);
          setIsNew(!isNew);
        }}
        marginBottom={"size-200"}
      >
        Piutang Baru
      </Button>
      <Flex
        isHidden={{ base: true, M: false }}
        marginBottom={"size-100"}
        direction={{ base: "column", M: "row" }}
        columnGap="size-100"
      >
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
      <Divider size={"S"} />
      {orders &&
        [{ ...initOrder, customerId: customerId }, ...orders.items].map(
          (x, i) => (
            <View
              key={x.id}
              borderStartColor={
                selectedOrderId === x.id ? "blue-500" : "transparent"
              }
              //paddingStart={selectedOrderId === x.id ? "size-100" : 0}
              borderStartWidth={selectedOrderId === x.id ? "thickest" : "thin"}
              //marginY={"size-125"}
            >
              {selectedOrderId === x.id ? (
                <OrderForm
                  data={x}
                  updateOrder={updateOrder}
                  closeForm={closeForm}
                />
              ) : (
                renderPiutang({ x, isNew })
              )}
            </View>
          )
        )}
      <div style={{ marginBottom: "24px" }} />
    </Fragment>
  );

  function renderPiutang({ x, isNew }: { x: iOrder; isNew: boolean; }) {

    return (
      <Fragment>
        <Flex
          isHidden={x.id === 0 && !isNew}
          marginY={"size-75"}
          direction={"row"}
          //direction={{base:"column", M:"row"}}
          columnGap="size-100"
          wrap={"wrap"}
        >
          <View flex={{ base: "50%", M: 1 }}>
            <ActionButton
              flex
              height={"auto"}
              isQuiet
              onPress={() => {
                setSelectedOrderId(selectedOrderId === x.id ? -1 : x.id);
              }}
            >
              <span style={{ fontWeight: 700 }}>
                {x.id === 0 ? "Piutang Baru" : x.descriptions}
              </span>
            </ActionButton>
            {x.id > 0 && <ToggleDetail isSelected={(detailId === x.id && showDetail)} showOrderDetail={(e) => {
              setDetailId(x.id)
              setShowDetail(e)
              }} />}
          </View>
          {x.id > 0 && renderDetail(x)}
        </Flex>
        {detailId === x.id && showDetail && 
          <OrderDetail
            order={x}
            updateOrder={updateOrder}
            orderId={selectedOrderId}
          />
        }
        {x.id > 0 && <Divider size={"S"} />}
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
  isSelected: boolean,
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

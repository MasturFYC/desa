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
} from "@adobe/react-spectrum";
import {
  dateParam,
  iPayment
} from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";

const PaymentForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initPayment: iPayment = {
  id: 0,
  customerId: 0,
  paymentDate: dateParam(null),
  refId: 0,
  total: 0,
  descriptions: "Cicilan",
};

type paymentProps = {
  customerId: number;
};

const PaymentPage: NextPage<paymentProps> = ({ customerId }) => {
  let [selectedPaymentId, setSelectedPaymentId] = useState<number>(-1);
  let [isNew, setIsNew] = useState<boolean>(false);

  let payments = useAsyncList<iPayment>({
    async load({ signal }) {
      let res = await fetch(`/api/customer/payment/${customerId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iPayment) => item.id,
  });

  const closeForm = () => {
    setSelectedPaymentId(-1);
    if (isNew) {
      setIsNew(false);
    }
  };

  const updateOrder = (method: string, p: iPayment) => {
    switch (method) {
      case "POST":
        {
          payments.insert(0, p);
        }
        break;
      case "PUT":
        {
          payments.update(selectedPaymentId, p);
        }
        break;
      case "DELETE":
        {
          payments.remove(selectedPaymentId);
        }
        break;
    }
  };

  return (
    <Fragment>
      <Button
        variant={"cta"}
        onPress={() => {
          setSelectedPaymentId(isNew ? -1 : 0);
          setIsNew(!isNew);
        }}
        marginBottom={"size-200"}
      >
        Cicilan Baru
      </Button>
      <Flex
        isHidden={{ base: true, M: false }}
        marginBottom={"size-100"}
        direction={{ base: "column", M: "row" }}
        columnGap="size-50"
      >
        <View width={"5%"}>ID#</View>
        <View flex width={{ base: "50%" }}>
          Keterangan
        </View>
        <View width={"20%"}>Tanggal</View>
        <View width="15%">
          <span style={{ textAlign: "right", display: "block" }}>Total</span>
        </View>
      </Flex>
      <Divider size={"S"} />
      {payments.isLoading && <WaitMe />}
      {payments &&
        [{ ...initPayment, customerId: customerId }, ...payments.items].map(
          (x, i) => (
            <View
              key={x.id}
              borderStartColor={
                selectedPaymentId === x.id ? "blue-500" : "transparent"
              }
              //paddingStart={selectedOrderId === x.id ? "size-100" : 0}
              borderStartWidth={selectedPaymentId === x.id ? "thickest" : "thin"}
              //marginY={"size-125"}
            >
              {selectedPaymentId === x.id ? (
                <PaymentForm
                  data={x}
                  updatePayment={updateOrder}
                  closeForm={closeForm}
                />
              ) : (
                renderKasbon({ x, isNew })
              )}
            </View>
          )
        )}
      <Flex direction={"row"}>
        <View flex>Grand Total: </View>
        <View>
          <Text>
            <strong>
              {FormatNumber(payments.items.reduce((a, b) => a + b.total, 0))}
            </strong>
          </Text>
        </View>
      </Flex>
      <div style={{ marginBottom: "24px" }} />
    </Fragment>
  );

  function renderKasbon({ x, isNew }: { x: iPayment; isNew: boolean }) {
    return (
      <Fragment>
        <Flex
          isHidden={x.id === 0 && !isNew}
          marginY={"size-75"}
          direction={"row"}
          //direction={{base:"column", M:"row"}}
          columnGap="size-50"
          wrap={"wrap"}
        >
          <View width={"5%"}>{x.id}</View>
          <View flex width={{ base: "50%", M: "auto" }}>
            <ActionButton
              height={"auto"}
              isQuiet
              onPress={() => {
                setSelectedPaymentId(selectedPaymentId === x.id ? -1 : x.id);
              }}
            >
              <span style={{ fontWeight: 700 }}>
                {x.id === 0 ? "Piutang Baru" : x.descriptions}
              </span>
            </ActionButton>
          </View>
          <View width={{ base: "40%", M: "20%" }}>
            {FormatDate(x.paymentDate)}
          </View>
          <View width={{ base: "48%", M: "15%" }}>
            <span
              style={{ textAlign: "right", display: "block", fontWeight: 700 }}
            >
              {FormatNumber(x.total)}
            </span>
          </View>
        </Flex>
        {x.id > 0 && <Divider size={"S"} />}
      </Fragment>
    );
  }
};

export default PaymentPage;

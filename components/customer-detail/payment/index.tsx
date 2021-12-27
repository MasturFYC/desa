import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { ActionButton, Button } from '@react-spectrum/button';
import { Flex } from '@react-spectrum/layout';
import { Text } from '@react-spectrum/text';
import { dateParam, iPayment } from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";


import Div from "@components/ui/Div";

const PaymentForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initPayment: iPayment = {
  id: 0,
  lunasId: 0,
  customerId: 0,
  paymentDate: dateParam(null),
  refId: 0,
  total: 0,
  descriptions: "Cicilan",
};

type paymentProps = {
  customerId: number;
};

export default function PaymentPage (props: paymentProps) {
  let { customerId } = props;
  let [selectedPaymentId, setSelectedPaymentId] = useState<number>(-1);

  let payments = useAsyncList<iPayment>({
    async load({ signal }) {
      let res = await fetch(`${process.env.apiKey}/customer/payment/${customerId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iPayment) => item.id,
  });

  const closeForm = () => {
    if(selectedPaymentId === 0) {
      payments.remove(0)
    }
    setSelectedPaymentId(-1);
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
          if(!payments.getItem(0)) {
            payments.insert(0, { ...initPayment, customerId: customerId });
          }
          setSelectedPaymentId(0);
        }}
        marginBottom={"size-200"}
      >
        Cicilan Baru
      </Button>
      <Div isHeader isHidden>
        <Flex
          isHidden={{ base: true, M: false }}
          marginX={"size-100"}
          direction={{ base: "column", M: "row" }}
          columnGap="size-50"
        >
          <View width={"5%"}>ID#</View>
          <View width={"20%"}>Tanggal</View>
          <View flex width={{ base: "50%" }}>
            Keterangan
          </View>
          <View width="15%">
            <span style={{ textAlign: "right", display: "block" }}>Total</span>
          </View>
        </Flex>
      </Div>
      {payments.isLoading && <WaitMe />}
      {payments &&
        payments.items.map((x, i) => (
          <Div
            key={x.id}
            isSelected={selectedPaymentId === x.id}
            selectedColor={"6px solid blue"}
          >
            {selectedPaymentId === x.id ? (
              <PaymentForm
                data={x}
                updatePayment={updateOrder}
                closeForm={closeForm}
              />
            ) : (
              renderPayment({ x })
            )}
          </Div>
        ))}
      <Div isFooter>
        <Flex direction={"row"} marginX={"size-100"}>
          <View flex>Grand Total: </View>
          <View>
            <Text>
              <strong>
                {FormatNumber(payments.items.reduce((a, b) => a + b.total, 0))}
              </strong>
            </Text>
          </View>
        </Flex>
      </Div>
    </Fragment>
  );

  function renderPayment({ x }: { x: iPayment }) {
    return (
      <Flex
        marginX={"size-100"}
        direction={"row"}
        columnGap="size-50"
        wrap={"wrap"}
      >
        <View width={"5%"}>{x.id}</View>
        <View width={{ base: "40%", M: "20%" }}>
          {FormatDate(x.paymentDate)}
        </View>
        <View flex width={{ base: "50%", M: "auto" }}>
          {x.refId > 0 
          ? x.descriptions
          :
          <ActionButton
            height={"auto"}
            isQuiet
            onPress={() => {
              setSelectedPaymentId(x.id);
            }}
          >
            <span style={{ fontWeight: 700 }}>
              {x.id === 0 ? "Piutang Baru" : x.descriptions}
            </span>
          </ActionButton>
          }
        </View>
        <View width={{ base: "48%", M: "15%" }}>
          <span
            style={{ textAlign: "right", display: "block", fontWeight: 700 }}
          >
            {FormatNumber(x.total)}
          </span>
        </View>
      </Flex>
    );
  }
};

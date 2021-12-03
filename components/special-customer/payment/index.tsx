import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import { ActionButton } from '@react-spectrum/button';
import { Flex } from '@react-spectrum/layout';
import { Text } from '@react-spectrum/text';

import { dateParam, iSpecialPayment } from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";
import Div from "@components/ui/Div";
import customer from "@components/customer";

const SpecialPaymentForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initPayment: iSpecialPayment = {
  id: 0,
  customerId: 0,
  payNum: '',
  paymentAt: dateParam(null),
  orderId: 0,
  nominal: 0,
  descriptions: "Angsuran pembayaran",
};

type SpecialPaymentProps = {
  customerId: number;
};

const SpecialPaymentPage: NextPage<SpecialPaymentProps> = (props) => {
  let { customerId } = props;
  let [selectedPaymentId, setSelectedPaymentId] = useState<number>(-1);

  let payments = useAsyncList<iSpecialPayment>({
    async load({ signal }) {
      let res = await fetch(`/api/customer/special-payment/${customerId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iSpecialPayment) => item.id,
  });

  const closeForm = () => {
    if(selectedPaymentId === 0) {
      payments.remove(0)
    }
    setSelectedPaymentId(-1);
  };

  const updateOrder = (method: string, p: iSpecialPayment) => {
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
      <Div isHeader isHidden>
        <Flex
          isHidden={{ base: true, M: false }}
          marginX={"size-100"}
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
              <View paddingX={"size-200"}>
              <SpecialPaymentForm
                data={{...x, customerId: customerId}}
                updatePayment={updateOrder}
                closeDialog={closeForm}
              />
              </View>
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
                {FormatNumber(payments.items.reduce((a, b) => a + b.nominal, 0))}
              </strong>
            </Text>
          </View>
        </Flex>
      </Div>
    </Fragment>
  );

  function renderPayment({ x }: { x: iSpecialPayment }) {
    return (
      <Flex
        marginX={"size-100"}
        direction={"row"}
        columnGap="size-50"
        wrap={"wrap"}
      >
        <View width={"5%"}>{x.id}</View>
        <View flex width={{ base: "50%", M: "auto" }}>
          <ActionButton
            height={"auto"}
            isQuiet
            onPress={() => {
              setSelectedPaymentId(x.id);
            }}
          >
            <span style={{ fontWeight: 700 }}>
              {x.payNum}
            </span>
          </ActionButton>
        </View>
        <View width={{ base: "40%", M: "20%" }}>
          {FormatDate(x.paymentAt)}
        </View>
        <View width={{ base: "48%", M: "15%" }}>
          <span
            style={{ textAlign: "right", display: "block", fontWeight: 700 }}
          >
            {FormatNumber(x.nominal)}
          </span>
        </View>
      </Flex>
    );
  }
};

export default SpecialPaymentPage;

import { NextPage } from "next";
import React, { useState } from "react";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { useAsyncList } from "@react-stately/data";
import { iPiutang } from "@components/interfaces";
import { CustomerBalanceDetail } from "./CustomerBalanceDetail";
import { FormatNumber } from "@lib/format";
import WaitMe from "@components/ui/wait-me";
import Div from "@components/ui/Div";
import Span from "@components/ui/SpanValue";

type CustomerPiutangProps = {
  customerId: number;
};

const CustomerPiutang: NextPage<CustomerPiutangProps> = ({ customerId }) => {
  let colWidth = { base: "33.3%", M: "33.3%" };
  let [showDetail, setShowDetail] = useState<boolean>(false);

  let payments = useAsyncList<iPiutang>({
    async load({ signal }) {
      let res = await fetch(`/api/customer/piutang/${customerId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iPiutang) => item.id,
  });

  return (
    <>
      <View marginBottom={"size-200"}>
        <span style={{ fontWeight: 700 }}>Piutang</span>
      </View>
      <Div isHeader isHidden aria-label={"Div header Piutang"}>
        <Flex
          direction={{ base: "column", M: "row" }}
          marginX={"size-100"}
          isHidden={{ base: true, M: false }}
        >
          <View width={{ base: "auto", M: "40%" }}>KETERANGAN</View>
          <Flex flex direction={"row"} columnGap={"size-100"}>
            <Span width={"33.3%"} isNumber>DEBIT</Span>
            <Span isNumber width={"33.3%"}>CREDIT</Span>
            <Span isNumber width={"33.3%"}>SALDO</Span>
          </Flex>
        </Flex>
      </Div>
      {payments.isLoading && <WaitMe />}
      {payments &&
        payments.items.map((x, i) => (
          <Div index={i} key={x.id} aria-label={"Div body value"}>
            <Flex direction={{ base: "column", M: "row" }} marginX={"size-100"}>
              <View width={{ base: "auto", M: "40%" }}>{x.descriptions}</View>
              <Flex flex direction={"row"} columnGap={"size-100"}>
                <Span width={"33.3%"} isNumber>{FormatNumber(x.debt)}</Span>
                <Span width={"33.3%"} isNumber>{FormatNumber(x.cred)}</Span>
                <Span width={"33.3%"} isTotal isNumber>{FormatNumber(x.saldo)}</Span>
              </Flex>
            </Flex>
          </Div>
        ))}
      <Div isFooter>
        <Flex direction={{ base: "column", M: "row" }} marginX={"size-100"}>
          <View width={{ base: "auto", M: "40%" }}>GRAND TOTAL</View>
          <Flex flex direction={"row"} columnGap={"size-100"}>
            <Span isNumber width={"33.3%"}>{FormatNumber(payments.items.reduce((a, b) => a + b.debt, 0))}</Span>
            <Span isNumber width={"33.3%"}>{FormatNumber(payments.items.reduce((a, b) => a + b.cred, 0))}</Span>
            <Span isNumber width={"33.3%"} isTotal>{FormatNumber(payments.items.reduce((a, b) => a + b.cred - b.debt, 0))}</Span>
          </Flex>
        </Flex>
      </Div>
      <Button
        isDisabled={showDetail}
        variant={"primary"}
        marginBottom={"size-100"}
        onPress={() => setShowDetail(true)}
      >
        Balance Detail
      </Button>
      {showDetail && (
          <CustomerBalanceDetail customerId={customerId} />
      )}
    </>
  );
};

export default CustomerPiutang;

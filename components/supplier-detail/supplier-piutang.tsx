import { NextPage } from "next";
import React, { useState } from "react";
import { iPiutang } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Button } from "@react-spectrum/button";
import { Divider } from "@react-spectrum/divider";
import { Flex } from "@react-spectrum/layout";
import { FormatNumber } from "@lib/format";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import dynamic from "next/dynamic";
import Div from "@components/ui/Div";
import Span from "@components/ui/SpanValue";

const SupplierBalanceDetail = dynamic(() => import("./supplier-balance"), {
  loading: () => <WaitMe />,
  ssr: false,
});

type SupplierPiutangProps = {
  supplierId: number;
};

const SupplierPiutang: NextPage<SupplierPiutangProps> = ({ supplierId }) => {
  let [showDetail, setShowDetail] = useState<boolean>(false);
  let colWidth = { base: "33.3%", M: "33.3%" };

  let payments = useAsyncList<iPiutang>({
    async load({ signal }) {
      let res = await fetch(`/api/supplier/piutang/${supplierId}`, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iPiutang) => item.id,
  });

  return (
    <>
      <View marginBottom={"size-200"}>
        <span style={{ fontWeight: 700 }}>Piutang Dagang</span>
      </View>
      <Div isHeader isHidden>
        <Flex
          direction={{ base: "column", M: "row" }}
          isHidden={{ base: true, M: false }}
          marginX={"size-100"}
        >
          <View width={{ base: "auto", M: "40%" }}>KETERANGAN</View>
          <Flex flex direction={"row"} columnGap={"size-100"}>
            <View width={colWidth}>
              <span style={{ textAlign: "right", display: "block" }}>
                DEBIT
              </span>
            </View>
            <View width={colWidth}>
              <span style={{ textAlign: "right", display: "block" }}>
                CREDIT
              </span>
            </View>
            <View width={colWidth}>
              <span style={{ textAlign: "right", display: "block" }}>
                SALDO
              </span>
            </View>
          </Flex>
        </Flex>
      </Div>
      {payments.isLoading && <WaitMe />}
      {payments &&
        payments.items.map((x, i) => (
          <Div index={i}>
            <Flex direction={{ base: "column", M: "row" }} marginX={"size-100"}>
              <View width={{ base: "auto", M: "40%" }}>{x.descriptions}</View>
              <Flex flex direction={"row"} columnGap={"size-100"}>
                <Span width={colWidth.base} isNumber>
                  {FormatNumber(x.debt)}
                </Span>
                <Span width={colWidth.base} isNumber>
                  {FormatNumber(x.cred)}
                </Span>
                <Span width={colWidth.base} isNumber isTotal>
                  {FormatNumber(x.saldo)}
                </Span>
              </Flex>
            </Flex>
          </Div>
        ))}
      <Div isFooter>
        <Flex direction={{ base: "column", M: "row" }} marginX={"size-100"}>
          <View width={{ base: "auto", M: "40%" }}>{"Grand Total"}</View>
          <Flex flex direction={"row"} columnGap={"size-100"}>
            <Span width={colWidth.base} isNumber>
              {FormatNumber(payments.items.reduce((a, b) => a + b.debt, 0))}
            </Span>
            <Span width={colWidth.base} isNumber>
              {FormatNumber(payments.items.reduce((a, b) => a + b.cred, 0))}
            </Span>
            <Span width={colWidth.base} isNumber isTotal>
              {FormatNumber(
                payments.items.reduce((a, b) => a + b.debt - b.cred, 0)
              )}
            </Span>
          </Flex>
        </Flex>
      </Div>
      <View><i>Keterangan: *) <b>minus</b> berarti ada kelebihan pembayaran yang harus dikembalikan oleh supplier</i></View>
      <Button
        isDisabled={showDetail}
        variant={"primary"}
        marginTop={"size-400"}
        marginBottom={"size-100"}
        onPress={() => setShowDetail(true)}
      >
        Balance Detail
      </Button>
      {showDetail && <SupplierBalanceDetail supplierId={supplierId} />}
    </>
  );
};

function getNumber(val: number | undefined) {
  return val ? val : 0;
}

export default SupplierPiutang;

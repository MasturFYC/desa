import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { iPiutang } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Divider, Flex } from "@adobe/react-spectrum";
import { FormatNumber } from "@lib/format";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";

type SupplierPiutangProps = {
  supplierId: number;
};

const SupplierPiutang: NextPage<SupplierPiutangProps> = ({ supplierId }) => {

  let colWidth = { base: "33.3%", M: "33.3%" };

  let payments = useAsyncList<iPiutang>({
    async load({ signal }) {
      let res = await fetch(`/api/supplier/piutang/${supplierId}`, { signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        }});
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
      <View backgroundColor={"gray-100"} paddingY={"size-50"}>
      <Flex
        direction={{ base: "column", M: "row" }}        
        isHidden={{ base: true, M: false }}
        marginX={"size-100"}
      >
        <View width={{ base: "auto", M: "40%" }}>Keterangan</View>
        <Flex flex direction={"row"} columnGap={"size-100"}>
          <View width={colWidth}>
            <span style={{ textAlign: "right", display: "block" }}>Credit</span>
          </View>
          <View width={colWidth}>
            <span style={{ textAlign: "right", display: "block" }}>Debit</span>
          </View>
          <View width={colWidth}>
            <span style={{ textAlign: "right", display: "block" }}>Saldo</span>
          </View>
        </Flex>
      </Flex>
      </View>
      {payments.isLoading && <WaitMe />}
      {payments &&
        payments.items.map((x, i) => (
          <>
            <Divider size="S" />
            <Flex direction={{ base: "column", M: "row" }} marginY={"size-75"} marginX={"size-100"}>
              <View width={{ base: "auto", M: "40%" }}>{x.descriptions}</View>
              <Flex flex direction={"row"} columnGap={"size-100"}>
                <View width={colWidth}>
                  <span style={{ textAlign: "right", display: "block" }}>
                    {FormatNumber(x.cred)}
                  </span>
                </View>
                <View width={colWidth}>
                  <span style={{ textAlign: "right", display: "block" }}>
                    {FormatNumber(x.debt)}
                  </span>
                </View>
                <View width={colWidth}>
                  <span
                    style={{
                      textAlign: "right",
                      display: "block",
                      fontWeight: 700,
                    }}
                  >
                    {FormatNumber(x.saldo)}
                  </span>
                </View>
              </Flex>
            </Flex>
          </>
        ))}
      <Divider size={"S"} />
      <View backgroundColor={"gray-100"} paddingY={"size-50"}>
      <Flex direction={{ base: "column", M: "row" }} marginX={"size-100"}>
        <View width={{ base: "auto", M: "40%" }}>{"Grand Total"}</View>
        <Flex flex direction={"row"} columnGap={"size-100"}>
          <View width={colWidth}>
            <span style={{ textAlign: "right", display: "block" }}>
              {FormatNumber(payments.items.reduce((a, b) => a + b.cred, 0))}
            </span>
          </View>
          <View width={colWidth}>
            <span style={{ textAlign: "right", display: "block" }}>
              {FormatNumber(payments.items.reduce((a, b) => a + b.debt, 0))}
            </span>
          </View>
          <View width={colWidth}>
            <span
              style={{ textAlign: "right", display: "block", fontWeight: 700 }}
            >
              {FormatNumber(
                payments.items.reduce((a, b) => a + b.cred - b.debt, 0)
              )}
            </span>
          </View>
        </Flex>
      </Flex>
      </View>
    </>
  );
};

function getNumber(val: number | undefined) {
  return val ? val : 0;
}

export default SupplierPiutang;

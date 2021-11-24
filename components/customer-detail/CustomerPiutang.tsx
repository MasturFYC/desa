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
      <View paddingY={"size-50"} backgroundColor={"gray-200"}>
        <Flex
          direction={{ base: "column", M: "row" }}
          marginX={"size-100"}
          isHidden={{ base: true, M: false }}
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
      </View>
      {payments.isLoading && <WaitMe />}
      {payments &&
        payments.items.map((x, i) => (
          <View
            paddingY={"size-50"}
            backgroundColor={i % 2 === 0 ? "transparent" : "gray-100"}
          >
            <Flex direction={{ base: "column", M: "row" }} marginX={"size-100"}>
              <View width={{ base: "auto", M: "40%" }}>{x.descriptions}</View>
              <Flex flex direction={"row"} columnGap={"size-100"}>
                <View width={colWidth}>
                  <span style={{ textAlign: "right", display: "block" }}>
                    {FormatNumber(x.debt)}
                  </span>
                </View>
                <View width={colWidth}>
                  <span style={{ textAlign: "right", display: "block" }}>
                    {FormatNumber(x.cred)}
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
          </View>
        ))}
      <View paddingY={"size-50"} backgroundColor={"gray-200"}>
        <Flex direction={{ base: "column", M: "row" }} marginX={"size-100"}>
          <View width={{ base: "auto", M: "40%" }}>GRAND TOTAL</View>
          <Flex flex direction={"row"} columnGap={"size-100"}>
            <View width={colWidth}>
              <span style={{ textAlign: "right", display: "block" }}>
                {FormatNumber(payments.items.reduce((a, b) => a + b.debt, 0))}
              </span>
            </View>
            <View width={colWidth}>
              <span style={{ textAlign: "right", display: "block" }}>
                {FormatNumber(payments.items.reduce((a, b) => a + b.cred, 0))}
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
                {FormatNumber(
                  payments.items.reduce((a, b) => a + b.cred - b.debt, 0)
                )}
              </span>
            </View>
          </Flex>
        </Flex>
      </View>
      <Button
        isDisabled={showDetail}
        variant={"primary"}
        onPress={() => setShowDetail(true)}
        marginTop={"size-400"}
      >
        Balance Detail
      </Button>
      {showDetail && (
        <View marginTop={"size-100"}>
          <CustomerBalanceDetail customerId={customerId} />
        </View>
      )}
    </>
  );
};

export default CustomerPiutang;

import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { iPiutang } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Divider, Flex } from "@adobe/react-spectrum";
import { FormatNumber } from "@lib/format";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";

type CustomerPiutangProps = {
  customerId: number;
};

const CustomerPiutang: NextPage<CustomerPiutangProps> = ({ customerId }) => {
  //let [customer, setCustomer] = useState<iPiutang>({} as iPiutang);
  let colWidth = { base: "33.3%", M: "33.3%" };

  let payments = useAsyncList<iPiutang>({
    async load({ signal }) {
      let res = await fetch(`/api/customer/piutang/${customerId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iPiutang) => item.id,
  });

  // useEffect(() => {
  //   let isLoaded = false;

  //   const loadCustomer = async (id: number) => {
  //     const url = `/api/customer/piutang/${id}`;
  //     const fetchOptions = {
  //       method: "GET",
  //       headers: {
  //         "Content-type": "application/json; charset=UTF-8",
  //       },
  //     };
  //     await fetch(url, fetchOptions)
  //       .then(async (response) => {
  //         if (response.ok) {
  //           return response.json().then((data) => data);
  //         }
  //         return response.json().then((error) => {
  //           return Promise.reject(error);
  //         });
  //       })
  //       .then((data) => {
  //         setCustomer(data)
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //       });

  //   };

  //   if (!isLoaded && customerId > 0) {
  //     loadCustomer(customerId);
  //   }

  //   return () => { isLoaded = true }

  // }, [customerId])

  return (
    <>
      <View marginBottom={"size-200"}>
        <span style={{ fontWeight: 700 }}>Piutang</span>
      </View>
      <Flex
        direction={{ base: "column", M: "row" }}
        marginY={"size-75"}
        isHidden={{ base: true, M: false }}
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
      {payments.isLoading && <WaitMe />}
      {payments &&
        payments.items.map((x, i) => (
          <>
            <Divider size="S" />
            <Flex direction={{ base: "column", M: "row" }} marginY={"size-75"}>
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
      <Divider size="M" />
      <Flex direction={{ base: "column", M: "row" }} marginY={"size-75"}>
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
    </>
  );
};

function getNumber(val: number | undefined) {
  return val ? val : 0;
}

export default CustomerPiutang;

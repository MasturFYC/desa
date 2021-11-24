import React from "react";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { FormatDate, FormatNumber } from "@lib/format";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { Property } from "csstype";
import Span from "@components/ui/SpanValue";

interface customerBalance {
  id: number;
  descriptions: string;
  trxDate: string;
  debt: number;
  cred: number;
  saldo: number;
}
type CustomerBalanceDetailProps = {
  customerId: number;
};

type columnType = {
  id: number;
  name: string;
  baseWidth: string;
  width: string;
  align: Property.TextAlign | undefined;
};

export function CustomerBalanceDetail({
  customerId,
}: CustomerBalanceDetailProps) {
  let columns: columnType[] = [
    { id: 0, name: "ID#", baseWidth: "9%", width: "5%", align: "left" },
    {
      id: 1,
      name: "KETERANGAN",
      baseWidth: "53%",
      width: "30%",
      align: "left",
    },
    {
      id: 2,
      name: "TGL TRANSAKSI",
      baseWidth: "auto",
      width: "20%",
      align: "left",
    },
    { id: 3, name: "DEBIT", baseWidth: "33%", width: "15%", align: "right" },
    { id: 4, name: "CREDIT", baseWidth: "33%", width: "15%", align: "right" },
    { id: 5, name: "SALDO", baseWidth: "33%", width: "15%", align: "right" },
  ];

  let payments = useAsyncList<customerBalance>({
    async load({ signal }) {
      let res = await fetch(`/api/customer/balance-detail/${customerId}`, {
        signal,
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: customerBalance) => item.id,
  }); 

  return (
    <>
      <View paddingY={"size-200"}>
        <span style={{ fontWeight: 700 }}>Rincian Piutang</span>
      </View>
      <View paddingY={"size-50"} backgroundColor={"gray-200"}>
        <Flex
          direction={{ base: "column", M: "row" }}
          marginX={"size-100"}
          isHidden={{ base: true, M: false }}
          columnGap={"size-50"}
        >
          {columns.map((item) => (
            <View key={item.id} width={{ base: item.baseWidth, M: item.width }}>
              <span style={{ textAlign: item.align, display: "block" }}>
                {item.name}
              </span>
            </View>
          ))}
        </Flex>
      </View>
      {payments.isLoading && <WaitMe />}
      {payments &&
        payments.items.map((item, i) => (
          <View
            paddingY={"size-50"}
            backgroundColor={i % 2 === 0 ? "transparent" : "gray-100"}
          >
            <Flex direction={{ base: "column", M: "row" }} marginX={"size-100"}>
              <Flex
                direction={"row"}                
                width={{ base: "auto", M: "55%" }}
                columnGap={"size-50"}
              >
                <View
                  width={{
                    base: columns[0].baseWidth,
                    M: columns[0].baseWidth,
                  }}
                >
                  {item.id}
                </View>
                <View
                  width={{
                    base: columns[1].baseWidth,
                    M: columns[1].baseWidth,
                  }}
                >
                  {item.descriptions}
                </View>
                <View
                  width={{
                    base: columns[2].baseWidth,
                    M: columns[2].baseWidth,
                  }}
                >
                  {FormatDate(item.trxDate)}
                </View>
              </Flex>
              <Flex
                direction={"row"}
                columnGap={"size-50"}
                width={{ base: "auto", M: "45%" }}
              >
                <View width={columns[3].baseWidth}>
                  <Span label={FormatNumber(item.debt)} isNumber />
                </View>
                <View width={columns[4].baseWidth}>
                  <Span label={FormatNumber(item.cred)} isNumber />
                </View>
                <View width={columns[5].baseWidth}>
                  <Span label={FormatNumber(item.saldo)} isTotal isNumber />
                </View>
              </Flex>
            </Flex>
          </View>
        ))}

      <View paddingY={"size-50"} backgroundColor={"gray-200"} marginBottom={"size-200"}>
        <Flex direction={{ base: "column", M: "row" }} marginX={"size-100"}>
          <View width={"55%"}>GRAND TOTAL</View>
          <Flex
            direction={"row"}
            columnGap={"size-50"}
            width={{ base: "auto", M: "45%" }}
          >
            <View width={columns[3].baseWidth}>
              <Span
                label={FormatNumber(
                  payments.items.reduce((a, b) => a + b.debt, 0)
                )}
                isNumber
              />
            </View>
            <View width={columns[4].baseWidth}>
              <Span
                label={FormatNumber(
                  payments.items.reduce((a, b) => a + b.cred, 0)
                )}
                isNumber
              />
            </View>
            <View width={columns[5].baseWidth}>
              <Span
                label={FormatNumber(
                  payments.items.reduce((a, b) => a + b.cred - b.debt, 0)
                )}
                isNumber
                isTotal
              />
            </View>
          </Flex>
        </Flex>
      </View>
    </>
  );
}

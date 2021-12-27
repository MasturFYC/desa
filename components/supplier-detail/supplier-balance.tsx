import React, { useEffect, useState } from "react";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { FormatDate, FormatNumber } from "@lib/format";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { Property } from "csstype";
import Span from "@components/ui/SpanValue";
import Div from "@components/ui/Div";
import { env } from 'process';

interface supplierBalance {
  id: number;
  supplierId: string;
  descriptions: string;
  trxRef: string;
  trxDate: string;
  debt: number;
  cred: number;
  saldo: number;
}
type SupplierBalanceDetailProps = {
  supplierId: number;
};

type columnType = {
  id: number;
  name: string;
  baseWidth: string;
  width: string;
  align: Property.TextAlign | undefined;
};

export default function SupplierBalanceDetail({
  supplierId
}: SupplierBalanceDetailProps) {
  let columns: columnType[] = [
    { id: 0, name: "ID#", baseWidth: "8.5%", width: "5%", align: "left" },
    {
      id: 1,
      name: "REF",
      baseWidth: "21.5%",
      width: "12%",
      align: "left",
    },
    {
      id: 2,
      name: "TGL TRX",
      baseWidth: "26%",
      width: "15%",
      align: "left",
    },
    {
      id: 3,
      name: "KETERANGAN",
      baseWidth: "44%",
      width: "23.5%",
      align: "left",
    },
    { id: 4, name: "DEBIT", baseWidth: "33%", width: "15%", align: "right" },
    { id: 5, name: "CREDIT", baseWidth: "33%", width: "15%", align: "right" },
    { id: 6, name: "SALDO", baseWidth: "33%", width: "15%", align: "right" },
  ];

  let payments = useAsyncList<supplierBalance>({
    async load({ signal }) {
      let res = await fetch(`${env.apiKey}/supplier/balance/${supplierId}`, {
        signal,
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: supplierBalance) => item.id,
  });

  return (
    <>
      <View marginTop={"size-100"}>
        <span style={{ fontWeight: 700 }}>Rincian Piutang</span>
      </View>
      <Div isHidden isHeader aria-label={"Div header piutang"}>
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
      </Div>
      {payments.isLoading && <WaitMe />}
      {payments &&
        payments.items.map((item, i) => (
          <Div index={i} key={item.id}>
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
                  {item.trxRef}
                </View>
                <View
                  width={{
                    base: columns[2].baseWidth,
                    M: columns[2].baseWidth,
                  }}
                >
                  {FormatDate(item.trxDate)}
                </View>
                <View
                  flex
                  width={{
                    base: columns[3].baseWidth,
                    M: columns[3].baseWidth,
                  }}
                >
                  {item.descriptions || '-'}
                </View>
              </Flex>
              <Flex
                direction={"row"}
                columnGap={"size-50"}
                width={{ base: "auto", M: "45%" }}
              >
                <Span width={columns[4].baseWidth} isNumber>{FormatNumber(item.debt)}</Span>
                <Span width={columns[5].baseWidth} isNumber>{FormatNumber(item.cred)}</Span>
                <Span width={columns[6].baseWidth} isTotal isNumber>{FormatNumber(item.saldo)}</Span>
              </Flex>
            </Flex>
          </Div>
        ))}

      <Div isFooter>
        <Flex direction={{ base: "column", M: "row" }} marginX={"size-100"}>
          <Span width={"55%"}>GRAND TOTAL</Span>
          <Flex
            direction={"row"}
            columnGap={"size-50"}
            width={{ base: "auto", M: "45%" }}
          >
            <Span width={columns[4].baseWidth} isNumber>{FormatNumber(payments.items.reduce((a, b) => a + b.debt, 0))}</Span>
            <Span width={columns[5].baseWidth} isNumber>{FormatNumber(payments.items.reduce((a, b) => a + b.cred, 0))}</Span>
            <Span width={columns[6].baseWidth} isNumber isTotal>{FormatNumber(payments.items.reduce((a, b) => a + b.debt - b.cred, 0))}</Span>
          </Flex>
        </Flex>
      </Div>
    </>
  );
}

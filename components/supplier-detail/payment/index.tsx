import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import { env } from 'process';
import { Divider } from "@react-spectrum/divider";
import { Flex } from "@react-spectrum/layout";
import {Text} from "@react-spectrum/text";
import {
  dateParam,
  iStockPayment
} from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";
import SpanLink from "@components/ui/span-link";

const StockPaymentForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initPayment: iStockPayment = {
  id: 0,
  stockId: 0,
  payDate: dateParam(null),
  nominal: 0,
  payNum: '',
  descriptions: 'Bayar Piutang Dagang',
};

type colName = {
  id: number;
  name: string;
  width: string;
}

const columns: colName[] = [
  { id: 0, name: "ID#", width: "5%" },
  { id: 1, name: "REF", width: "5%" },
  { id: 2, name: "NO. BAYAR", width: "20%" },
  { id: 3, name: "TANGGAL", width: "15%" },
  { id: 4, name: "KETERANGAN", width: "auto" },
  { id: 5, name: "NOMINAL", width: "15%" }
]

type stockPaymentProps = {
  supplierId: number;
};

const StockPaymentPage: NextPage<stockPaymentProps> = ({ supplierId }) => {
  let [selectedPaymentId, setSelectedPaymentId] = useState<number>(-1);
  let [isNew, setIsNew] = useState<boolean>(false);

  let payments = useAsyncList<iStockPayment>({
    async load({ signal }) {
      let res = await fetch(`${env.apiKey}/supplier/payment/${supplierId}`, {
        signal,
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        }
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iStockPayment) => item.id,
  });

  const closeForm = () => {
    setSelectedPaymentId(-1);
    if (isNew) {
      setIsNew(false);
    }
  };

  const updateOrder = (method: string, p: iStockPayment) => {
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
      <View backgroundColor={"gray-200"} padding={"size-50"}>
        <Flex
          isHidden={{ base: true, M: false }}
          direction={{ base: "column", M: "row" }}
          columnGap="size-50"
          marginX={"size-100"}
        >
          {columns.map(col => (
            <View key={col.id} width={col.width} flex={col.id === 4 ? "1" : "none"}><span style={{textAlign: col.id === 5 ? "right" : "left", display:"block"}}>{col.name}</span></View>
          ))}
        </Flex>
      </View>
      {payments.isLoading && <WaitMe />}
      {payments &&
        [{ ...initPayment, supplierId: supplierId }, ...payments.items].map(
          (x, i) => (
            <View
              backgroundColor={i % 2 === 0 ? "gray-75" : "gray-50"}
              key={x.id}
              borderStartColor={
                selectedPaymentId === x.id ? "blue-500" : "transparent"
              }
              //paddingStart={selectedOrderId === x.id ? "size-100" : 0}
              borderStartWidth={selectedPaymentId === x.id ? "thickest" : "thin"}
            //marginY={"size-125"}
            >
              {selectedPaymentId === x.id ? (
                <View backgroundColor={"gray-100"} paddingX={"size-200"}>
                  <StockPaymentForm
                    data={x}
                    updatePayment={updateOrder}
                    closeForm={closeForm}
                  />
                </View>
              ) : (
                renderPayment({ x, isNew })
              )}
            </View>
          )
        )}
        <Divider size="M" />
      <View backgroundColor={"gray-100"} padding={"size-50"}>
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
      </View>
      <br />
    </Fragment>
  );

  function renderPayment({ x, isNew }: { x: iStockPayment; isNew: boolean }) {
    return (
      <View padding={"size-50"}>
        <Flex
          isHidden={x.id === 0 && !isNew}
          marginX={"size-100"}
          direction={"row"}
          //direction={{base:"column", M:"row"}}
          columnGap="size-50"
          wrap={"wrap"}
        >
          <View width={columns[0].width}>{x.id}</View>
          <View width={columns[1].width}>{x.stockId}</View>
          <View width={{ base: "50%", M: columns[2].width }}>
            <SpanLink
              onClick={() => setSelectedPaymentId(selectedPaymentId === x.id ? -1 : x.id)}
            >
                {x.payNum}
            </SpanLink>
          </View>
          <View width={{ base: "40%", M: columns[3].width }}>
            {FormatDate(x.payDate)}
          </View>
          <View flex width={{ base: "48%", M: columns[4].width }}>
            {x.descriptions}
          </View>
          <View width={{ base: "48%", M: columns[5].width }}>
            <span
              style={{ textAlign: "right", display: "block", fontWeight: 700 }}
            >
              {FormatNumber(x.nominal)}
            </span>
          </View>
        </Flex>
      </View>
    );
  }
};

export default StockPaymentPage;

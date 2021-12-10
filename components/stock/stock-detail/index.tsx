import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList, AsyncListData } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import { ActionButton } from "@react-spectrum/button";
import { Divider } from "@react-spectrum/divider";
import { Flex } from "@react-spectrum/layout";
import PinAdd from "@spectrum-icons/workflow/Add";

import { iStockDetail, iStock, iProduct } from "@components/interfaces";
import { FormatNumber } from "@lib/format";

const StockDetailForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initStockDetail: iStockDetail = {
  stockId: 0,
  id: 0,
  unitId: 0,
  productId: 0,
  qty: 1,
  content: 0,
  unitName: "",
  realQty: 0,
  price: 0,
  discount: 0,
  subtotal: 0,
};

type StockDetailProps = {
  products: AsyncListData<iProduct>;
  stockId: number;
  //  stock: iStock;
  updateTotal: (stockId: number, subtotal: number) => void;
};

const StockDetail: NextPage<StockDetailProps> = ({
  products,
  stockId,
  updateTotal,
}) => {
  let [selectedDetailId, setSelectedDetailId] = useState<number>(-1);
  let [detail, setDetail] = useState<iStockDetail>(initStockDetail);
  let [isNew, setIsNew] = useState<boolean>(false);

  let stockDetails = useAsyncList<iStockDetail>({
    async load({ signal }) {
      let res = await fetch(`/api/stock-detail/${stockId}`, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();
      return { items: res.status === 200 ? json : [] };
    },
    getKey: (item: iStockDetail) => item.id,
  });

  const closeForm = () => {
    setSelectedDetailId(-1);
    if (isNew) {
      setIsNew(false);
    }
  };

  const updateStockDetail = (method: string, p: iStockDetail) => {
    switch (method) {
      case "POST":
        {
          stockDetails.append(p);
          updateTotal(p.stockId, p.qty * (p.price - p.price));
        }
        break;
      case "PUT":
        {
          stockDetails.update(p.id, p);
          updateTotal(p.stockId, (p.qty * (p.price - p.discount)) - detail.subtotal);
        }
        break; 
      case "DELETE":
        {
          stockDetails.remove(p.id);
          updateTotal(p.stockId, -detail.subtotal);
        }
        break;
    }
  };

  return (
    <View>
      <View paddingY={"size-50"} backgroundColor={"gray-200"} marginY={"size-200"}>
          <Flex
            isHidden={{ base: true, M: false }}
            direction={{ base: "column", M: "row" }}
            columnGap="size-100"
          >
            <View width="5%" paddingStart={"size-100"}>ID#</View>
            <View flex>NAMA BARANG</View>
            <View width={"20%"}>QTY / UNIT</View>
            <View width="10%">
              <span style={{ textAlign: "right", display: "block" }}>HARGA</span>
            </View>
            <View width="10%">
              <span style={{ textAlign: "right", display: "block" }}>DICOUNT</span>
            </View>
            <View width="10%" paddingEnd={"size-100"}>
              <span style={{ textAlign: "right", display: "block" }}>SUBTOTAL</span>
            </View>
          </Flex>
          <Divider size={"S"} />
        </View>
        {stockDetails.isLoading && <WaitMe />}
        {stockDetails &&
          [...stockDetails.items, { ...initStockDetail, stockId: stockId }].map(
            (x, i) => (
              <View
                paddingStart={selectedDetailId === x.id ? 7 : 0}
                key={x.id}
                borderStartColor={
                  selectedDetailId === x.id ? "orange-500" : "transparent"
                }
                //paddingStart={selectedstockId === x.id ? "size-100" : 0}
                borderStartWidth={selectedDetailId === x.id ? "thickest" : "thin"}
              //marginY={"size-125"}
              >
                {renderDetails(x, isNew)}
                {selectedDetailId === x.id && (
                  <StockDetailForm
                    products={products}
                    data={x}
                    updateDetail={updateStockDetail}
                    closeForm={closeForm}
                  />)}

              </View>
            )
          )}
   </View>
  );

  function renderDetails(x: iStockDetail, isNew: boolean) {
    return (
      <Fragment>
        <Flex
          marginY={"size-75"}
          direction={"row"}
          //direction={{base:"column", M:"row"}}
          columnGap="size-100"
          wrap={"wrap"}
        >
          {x.id > 0 && <View width={"5%"} paddingStart={"size-100"}>{x.id}</View>}
          <View flex={{ base: "50%", M: 1 }}>
            <ActionButton
              flex
              height={"auto"}
              isQuiet
              onPress={() => {
                setSelectedDetailId(selectedDetailId === x.id ? -1 : x.id);
                setDetail(x);
              }}
            >
              {x.id === 0 ? (
                <>
                  <PinAdd size="S" />
                  Add Item
                </>
              ) : (
                <span style={{ fontWeight: 700 }}>
                  {x.productName} - {x.spec}
                </span>
              )}
            </ActionButton>
          </View>
          {x.id > 0 && renderDetail(x)}
        </Flex>
        {x.id > 0 && <Divider size={"S"} />}
      </Fragment>
    );
  }

  function renderDetail(x: iStockDetail): React.ReactNode {
    return (
      <>
        <View width={{ base: "50%", M: "20%" }}>
          {FormatNumber(x.qty)} {x.unitName}
        </View>
        <View width={"10%"} isHidden={{ base: true, M: false }}>
          <span style={{ textAlign: "right", display: "block" }}>
            {FormatNumber(x.price)}
          </span>
        </View>
        <View width={"10%"} isHidden={{ base: true, M: false }}>
          <span style={{ textAlign: "right", display: "block" }}>
            {FormatNumber(x.discount)}
          </span>
        </View>
        <View width={{ base: "47%", M: "10%" }} paddingEnd={"size-100"}>
          <span
            style={{ textAlign: "right", display: "block", fontWeight: 700 }}
          >
            {FormatNumber(x.subtotal)}
          </span>
        </View>
      </>
    );
  }
};

export default StockDetail;

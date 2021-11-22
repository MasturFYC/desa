import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList, AsyncListData } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import { ActionButton, Divider, Flex } from "@adobe/react-spectrum";
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
      let res = await fetch(`/api/stock-detail/${stockId}`, { signal });
      let json = await res.json();
      return { items: json };
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
          updateTotal(p.stockId, p.qty * p.price);
        }
        break;
      case "PUT":
        {
          stockDetails.update(p.id, p);
          updateTotal(p.stockId, p.qty * p.price - detail.subtotal);
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
    <Fragment>
      <View backgroundColor={"gray-100"} marginBottom={"size-400"} padding={{ base: "size-50", M: "size-200" }}>
        <View paddingY={"size-50"}>
          <Flex
            isHidden={{ base: true, M: false }}
            marginBottom={"size-100"}
            direction={{ base: "column", M: "row" }}
            columnGap="size-100"
          >
            <View width="5%">ID#</View>
            <View flex>Nama Barang</View>
            <View width={"20%"}>Qty / Unit</View>
            <View width="10%">
              <span style={{ textAlign: "right", display: "block" }}>Harga</span>
            </View>
            <View width="10%">
              <span style={{ textAlign: "right", display: "block" }}>Subtotal</span>
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
    </Fragment>
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
          {x.id > 0 && <View width={"5%"}>{x.id}</View>}
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
        <View width={{ base: "47%", M: "10%" }}>
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

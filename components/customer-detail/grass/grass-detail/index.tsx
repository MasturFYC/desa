import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { Text } from "@react-spectrum/text";
import { NextPage } from "next";
import { ActionButton } from "@react-spectrum/button";
import { Flex } from "@react-spectrum/layout";
import PinAdd from "@spectrum-icons/workflow/Add";
import { AsyncListData } from "@react-stately/data";

import { iGrassDetail, iProduct } from "@components/interfaces";
import Div from "@components/ui/Div";
import product from "@components/product";
import ProductList from "@components/product/ProductList";

const GrassDetailForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initGrassDetail: iGrassDetail = {
  grassId: 0,
  id: 0,
  unitId: 0,
  qty: 0,
  content: 0,
  unitName: "",
  realQty: 0,
  price: 0,
  subtotal: 0,
  buyPrice: 0,
  productId: 0,
};

type GrassDetailProps = {
  grassId: number;
  products: AsyncListData<iProduct>;
  updateTotal: (total: number, qty: number) => void;
};

export default function GrassDetail(props: GrassDetailProps): JSX.Element {
  let { grassId, updateTotal, products } = props;
  let [selectedDetailId, setSelectedDetailId] = useState<number>(-1);
  let [detail, setDetail] = useState<iGrassDetail>(initGrassDetail);
  let [isNew, setIsNew] = useState<boolean>(false);

  let grassDetails = useAsyncList<iGrassDetail>({
    async load({ signal }) {
      let res = await fetch(`/api/grass-detail/${grassId}`, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iGrassDetail) => item.id,
  });

  const closeForm = () => {
    setSelectedDetailId(-1);
    if (isNew) {
      setIsNew(false);
    }
  };

  const updateGrassDetail = (method: string, p: iGrassDetail) => {
    switch (method) {
      case "POST":
        {
          grassDetails.append(p);
        }
        break;
      case "PUT":
        {
          grassDetails.update(p.id, p);
        }
        break;
      case "DELETE":
        {
          grassDetails.remove(p.id);
        }
        break;
    }
    updateTotal(
      grassDetails.items.reduce((a, b) => a + b.subtotal, 0),
      grassDetails.items.reduce((a, b) => a + b.qty * b.content, 0)
    );
  };

  return (
    <Fragment>
      <Div isHidden isHeader>
        <Flex
          marginX={"size-100"}
          direction={{ base: "column", M: "row" }}
          columnGap="size-100"
        >
          <View width="5%">ID#</View>
          <View flex>Keterangan</View>
          <View width={"20%"}>
            <span
              style={{
                textAlign: "right",
                fontWeight: 700,
                display: "block",
              }}
            >
              Qty (kg)
            </span>
          </View>
        </Flex>
      </Div>
      {grassDetails.isLoading && <WaitMe />}
      {grassDetails &&
        [...grassDetails.items, { ...initGrassDetail, grassId: grassId }].map(
          (x, i) => (
            <Div
              index={i}
              key={x.id}
              isSelected={selectedDetailId === x.id}
              selectedColor={"6px solid orange"}
            >
              {selectedDetailId === x.id ? (
                <GrassDetailForm
                  products={products}
                  data={x}
                  updateDetail={updateGrassDetail}
                  closeForm={closeForm}
                />
              ) : (
                renderDetails(i, x, isNew)
              )}
            </Div>
          )
        )}
    </Fragment>
  );

  function renderDetails(index: number, x: iGrassDetail, isNew: boolean) {
    return (
      <Flex direction={"row"} columnGap="size-100" wrap={"wrap"}>
        {x.id > 0 && <View width={"5%"}>{x.id}</View>}
        <View flex={{ base: "50%", M: 1 }}>
          <ActionButton
            flex
            isDisabled={x.grassId === 0}
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
              <Text>
                <b>Timbangan ke {index + 1}</b>
              </Text>
            )}
          </ActionButton>
        </View>
        {x.id > 0 && (
          <View width={"20%"}>
            <span
              style={{ textAlign: "right", fontWeight: 700, display: "block" }}
            >
              {x.qty}
            </span>
          </View>
        )}
      </Flex>
    );
  }
}

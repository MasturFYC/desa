import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { ActionButton } from "@react-spectrum/button";
import { Flex } from "@react-spectrum/layout";
import PinAdd from "@spectrum-icons/workflow/Add";
import { AsyncListData } from "@react-stately/data";

import { iGrassDetail, iProduct } from "@components/interfaces";
import Div from "@components/ui/Div";
import { Divider } from "@react-spectrum/divider";
import { FormatNumber } from "@lib/format";

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
      let res = await fetch(`${process.env.apiKey}/grass-detail/${grassId}`, {
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
          updateTotal(p.subtotal, p.realQty);
        }
        break;
      case "PUT":
        {
          grassDetails.update(p.id, p);
          updateTotal(p.subtotal - detail.subtotal, p.realQty - detail.realQty);
        }
        break;
      case "DELETE":
        {
          grassDetails.remove(p.id);
          updateTotal(-detail.subtotal, -detail.realQty);
        }
        break;
    }
  };

  return (
    <Fragment>
      <Div isHeader>
        <Flex
          isHidden={{ base: true, M: false }}
          marginX={"size-100"}
          direction={{ base: "column", M: "row" }}
          columnGap="size-100"
        >
          <View width="5%">ID#</View>
          <View flex>NAMA BARANG</View>
          <View width={"20%"}>QTY/UNIT</View>
          <View width="10%">
            <span style={{ textAlign: "right", display: "block" }}>HARGA</span>
          </View>
          <View width="10%">
            <span style={{ textAlign: "right", display: "block" }}>
              SUBTOTAL
            </span>
          </View>
        </Flex>
        <Divider size={"S"} />
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
      <Flex direction={"row"} flex marginTop={'size-50'}>
        <View flex>Total:</View>
        <View marginEnd={'size-100'}>
          <strong>
            {FormatNumber(
              grassDetails.items.reduce((a, b) => a + b.subtotal, 0)
            )}
          </strong>
        </View>
      </Flex>
    </Fragment>
  );

  function renderDetails(index: number, x: iGrassDetail, isNew: boolean) {
    return (
      <Flex
        marginX={"size-100"}
        direction={"row"}
        //direction={{base:"column", M:"row"}}
        columnGap="size-100"
        wrap={"wrap"}
      >
        {x.id > 0 && <View width={"5%"}>{x.id}</View>}
        <View flex={{ base: "50%", M: 1 }}>
          <ActionButton
            flex
            isDisabled={grassId === 0}
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
    );
  }

  function renderDetail(x: iGrassDetail): React.ReactNode {
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
}

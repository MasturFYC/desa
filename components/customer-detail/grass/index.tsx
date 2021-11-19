import dynamic from "next/dynamic";
import React, { Fragment, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import {
  ActionButton,
  Button,
  Divider,
  Flex,
  Text,
  ToggleButton,
} from "@adobe/react-spectrum";
import {
  dateParam,
  iGrass,
  iGrassDetail,
  iProduct,
} from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";
import Pin from "@spectrum-icons/workflow/PinOff";
import product from "@components/product";

const GrassDetail = dynamic(
  () => import("@components/customer-detail/grass/grass-detail"),
  {
    loading: () => <WaitMe />,
    ssr: false,
  }
);

const GrassForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initGrass: iGrass = {
  id: 0,
  customerId: 0,
  orderDate: dateParam(null),
  descriptions: "Pembelian Rumput Laut",
  qty: 0,
  price: 0,
  total: 0
};

type GrassProps = {
  customerId: number;
};

const Grass: NextPage<GrassProps> = ({ customerId }) => {
  let [showDetail, setShowDetail] = useState<boolean>(false);
  let [selectedGrassId, setSelectedGrassId] = useState<number>(-1);
  let [detailId, setDetailId] = useState<number>(0);
  let [isNew, setIsNew] = useState<boolean>(false);

  let grasses = useAsyncList<iGrass>({
    async load({ signal }) {
      let res = await fetch(`/api/customer/grass/${customerId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iGrass) => item.id,
  });

  const closeForm = () => {
    setSelectedGrassId(-1);
    if (isNew) {
      setIsNew(false);
    }
  };

  const updateData = (method: string, p: iGrass) => {
    switch (method) {
      case "POST":
        {
          grasses.insert(0, p);
        }
        break;
      case "PUT":
        {
          grasses.update(selectedGrassId, p);
        }
        break;
      case "DELETE":
        {
          grasses.remove(selectedGrassId);
        }
        break;
    }
  };

  const updateTotal = (grassId: number, qty: number) => {
    let o = grasses.getItem(grassId);
    let totalQty = o.qty + qty;
    let totalPrice = totalQty * o.price;

    grasses.update(grassId, { ...o, qty: totalQty, total: totalPrice });
  };

  return (
    <Fragment>
      <Button
        variant={"cta"}
        onPress={() => {
          setSelectedGrassId(isNew ? -1 : 0);
          setIsNew(!isNew);
        }}
        marginBottom={"size-200"}
      >
        Pembelian Baru
      </Button>
      <Flex
        isHidden={{ base: true, M: false }}
        marginBottom={"size-100"}
        direction={{ base: "column", M: "row" }}
        columnGap="size-100"
      >
        <View width={"5%"}>ID#</View>
        <View flex>Keterangan</View>
        <View width={"20%"}>Tanggal</View>
        <View width="10%">
          <span style={{ textAlign: "right", display: "block" }}>Qty (kg)</span>
        </View>
        <View width="13%">
          <span style={{ textAlign: "right", display: "block" }}>Harga</span>
        </View>
        <View width="15%">
          <span style={{ textAlign: "right", display: "block" }}>Subtotal</span>
        </View>
      </Flex>
      <Divider size={"S"} />
      {grasses &&
        [{ ...initGrass, customerId: customerId }, ...grasses.items].map(
          (x, i) => (
            <View
              key={x.id}
              borderStartColor={
                selectedGrassId === x.id ? "blue-500" : "transparent"
              }
              //paddingStart={selectedOrderId === x.id ? "size-100" : 0}
              borderStartWidth={selectedGrassId === x.id ? "thickest" : "thin"}
              //marginY={"size-125"}
            >
              {selectedGrassId === x.id ? (
                <GrassForm
                  data={x}
                  updateGrass={updateData}
                  closeForm={closeForm}
                />
              ) : (
                renderPembelian({ x, isNew })
              )}
            </View>
          )
        )}
      <Flex direction={"row"}>
        <View flex>Grand Total</View>
        <View>
          <Text>
            <strong>
              {FormatNumber(
                grasses.items.reduce((a, b) => a + b.total, 0)
              )}
            </strong>
          </Text>
        </View>
      </Flex>
      <div style={{ marginBottom: "24px" }} />
    </Fragment>
  );

  function renderPembelian({ x, isNew }: { x: iGrass; isNew: boolean }) {
    return (
      <Fragment>
        <Flex
          isHidden={x.id === 0 && !isNew}
          marginY={"size-75"}
          direction={"row"}
          //direction={{base:"column", M:"row"}}
          columnGap="size-100"
          wrap={"wrap"}
        >
          <View width={"5%"}>{x.id}</View>
          <View flex={{ base: "50%", M: 1 }}>
            <ActionButton
              flex
              height={"auto"}
              isQuiet
              onPress={() => {
                setSelectedGrassId(selectedGrassId === x.id ? -1 : x.id);
              }}
            >
              <span style={{ fontWeight: 700 }}>
                {x.id === 0 ? "Pembelian Baru" : x.descriptions}
              </span>
            </ActionButton>
            {x.id > 0 && (
              <ToggleDetail
                isSelected={detailId === x.id && showDetail}
                showGrassDetail={(e) => {
                  setDetailId(x.id);
                  setShowDetail(e);
                }}
              />
            )}
          </View>
          {x.id > 0 && renderDetail(x)}
        </Flex>
        {detailId === x.id && showDetail && (
          <GrassDetail
            grassId={x.id}
            updateTotal={updateTotal}
          />
        )}
        {x.id > 0 && <Divider size={"S"} />}
      </Fragment>
    );
  }

  function renderDetail(x: iGrass): React.ReactNode {
    return (
      <>
        <View width={{ base: "50%", M: "20%" }}>{FormatDate(x.orderDate)}</View>
        <View width={"10%"} isHidden={{ base: true, M: false }}>
          <span style={{ textAlign: "right", display: "block" }}>
            {FormatNumber(x.qty)}
          </span>
        </View>
        <View width={"13%"} isHidden={{ base: true, M: false }}>
          <span style={{ textAlign: "right", display: "block" }}>
            {FormatNumber(x.price)}
          </span>
        </View>
        <View width={{ base: "47%", M: "15%" }}>
          <span
            style={{ textAlign: "right", display: "block", fontWeight: 700 }}
          >
            {FormatNumber(x.total)}
          </span>
        </View>
      </>
    );
  }
};

export default Grass;

type ToggleDetailProps = {
  isSelected: boolean;
  showGrassDetail: (isShow: boolean) => void;
};

function ToggleDetail({ isSelected, showGrassDetail }: ToggleDetailProps) {
  // let [isShow, setIsShow] = useState<boolean>(isSelected);

  return (
    <ToggleButton
      flex
      height={"auto"}
      marginStart={"size-200"}
      isEmphasized
      isSelected={isSelected}
      onChange={(e) => {
        //        setIsShow(e);
        showGrassDetail(e);
      }}
      isQuiet
    >
      <Pin aria-label="Pin" />
      <Text>Details</Text>
    </ToggleButton>
  );
}

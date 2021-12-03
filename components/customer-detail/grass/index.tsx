import dynamic from "next/dynamic";
import React, { Fragment, useEffect, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { NextPage } from "next";
import { ActionButton, Button, Flex, Text } from "@adobe/react-spectrum";
import { dateParam, iCategory, iCustomer, iGrass, iProduct } from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";
import Div from "@components/ui/Div";

// const GrassDetail = dynamic(
//   () => import("@components/customer-detail/grass/grass-detail"),
//   {
//     loading: () => <WaitMe />,
//     ssr: false,
//   }
// );

const GrassForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initGrass: iGrass = {
  id: 0,
  customerId: 0,
  productId: 0,
  unitId: 0,
  unitName: '',
  content: 0,
  realQty: 0,
  buyPrice: 0,
  totalDiv: 0,
  orderDate: dateParam(null),
  descriptions: "Pembelian Rumput Laut",
  qty: 0,
  price: 0,
  total: 0,
};

type GrassProps = {
  customerId: number;
  customerDiv: number;
};

const Grass: NextPage<GrassProps> = ({ customerId, customerDiv }) => {
  //  let [showDetail, setShowDetail] = useState<boolean>(false);
  let [selectedGrassId, setSelectedGrassId] = useState<number>(-1);
  let [custDiv, setCustDiv] = useState<iCustomer>({} as iCustomer);
  // let [detailId, setDetailId] = useState<number>(0);

  let grasses = useAsyncList<iGrass>({
    async load({ signal }) {
      let res = await fetch(`/api/customer/grass/${customerId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iGrass) => item.id,
  });

  let products = useAsyncList<iProduct>({
    async load({ signal }) {
      let res = await fetch("/api/product/list", {
        signal,
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        }
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iProduct) => item.id,
  });

  useEffect(() => {
    let isLoaded = false;

    const loadCustomerDiv = async () => {
      let res = await fetch(`/api/customer/${customerDiv}`, {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();
      if(res.status === 200) {
        setCustDiv(json);
      }
    };

    if (!isLoaded && customerDiv > 0) {
      loadCustomerDiv();
    }
    return () => {
      isLoaded = true;
    };
  }, [customerDiv]);

  const closeForm = () => {
    if (selectedGrassId === 0) {
      grasses.remove(0);
    }
    setSelectedGrassId(-1);
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
          if (!grasses.getItem(0)) {
            grasses.insert(0, { ...initGrass, customerId: customerId });
          }
          setSelectedGrassId(0);
        }}
        marginBottom={"size-200"}
      >
        Pembelian Baru
      </Button>
      <Div isHeader isHidden>
        <Flex
          marginX={"size-100"}
          direction={{ base: "column", M: "row" }}
          columnGap="size-100"
        >
          <View width={"5%"}>ID#</View>
          <View flex>KETERANGAN</View>
          <View width={"15%"}>TANGGAL</View>
          <View width="7%">
            <span style={{ textAlign: "right", display: "block" }}>
              QTY (kg)
            </span>
          </View>
          <View width="9%">
            <span style={{ textAlign: "right", display: "block" }}>HARGA</span>
          </View>
          <View width="10%">
            <span style={{ textAlign: "right", display: "block" }}>JML HARGA</span>
          </View>
          <View width="10%">
            <span style={{ textAlign: "right", display: "block" }}>
              BAGI HASIL
            </span>
          </View>
          <View width="10%">
            <span style={{ textAlign: "right", display: "block" }}>
              SUBTOTAL
            </span>
          </View>
        </Flex>
      </Div>
      {grasses &&
        grasses.items.map((x, i) => (
          <Div
            key={x.id}
            index={i}
            isSelected={selectedGrassId === x.id}
            // || showDetail}
            selectedColor={"6px solid darkgreen"}
          >
            {selectedGrassId === x.id ? (
              <GrassForm
                data={x}
                products={products}
                customerDiv={custDiv}
                updateGrass={updateData}
                closeForm={closeForm}
              />
            ) : (
              renderPembelian({ x })
            )}
          </Div>
        ))}
      <Div isFooter>
        <Flex direction={"row"} marginX={"size-100"}>
          <View flex>
            Grand Total (
            <strong>
              {FormatNumber(grasses.items.reduce((a, b) => a + b.qty, 0))}
            </strong>{" "}
            kg)
          </View>
          <View>
            <Text>
              <strong>
                {FormatNumber(grasses.items.reduce((a, b) => a + b.total, 0))}
              </strong>
            </Text>
          </View>
        </Flex>
      </Div>
    </Fragment>
  );

  function renderPembelian({ x }: { x: iGrass }) {
    return (
      <Fragment>
        <Flex
          marginX={"size-100"}
          direction={"row"}
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
                setSelectedGrassId(x.id);
              }}
            >
              <span style={{ fontWeight: 700, textAlign: "left" }}>
                {x.id === 0 ? "Pembelian Baru" : x.descriptions}
              </span>
            </ActionButton>
            {/* {x.id > 0 && (
              <ToggleDetail
                isSelected={detailId === x.id && showDetail}
                showGrassDetail={(e) => {
                  setDetailId(x.id);
                  setShowDetail(e);
                }}
              />
            )} */}
          </View>
          {x.id > 0 && renderDetail(x)}
        </Flex>
        {/* {detailId === x.id && showDetail && (
          <GrassDetail grassId={x.id} updateTotal={updateTotal} />
        )} */}
      </Fragment>
    );
  }

  function renderDetail(x: iGrass): React.ReactNode {
    return (
      <>
        <View width={{ base: "50%", M: "15%" }}>{FormatDate(x.orderDate)}</View>
        <View width={"7%"} isHidden={{ base: true, M: false }}>
          <span style={{ textAlign: "right", display: "block" }}>
            {FormatNumber(x.qty)}
          </span>
        </View>
        <View width={"9%"} isHidden={{ base: true, M: false }}>
          <span style={{ textAlign: "right", display: "block" }}>
            {FormatNumber(x.price)}
          </span>
        </View>
        <View width={{ base: "47%", M: "10%" }}>
          <span
            style={{ textAlign: "right", display: "block", fontWeight: 700 }}
          >
            {FormatNumber(x.totalDiv + x.total)}
          </span>
        </View>
        <View width={{ base: "47%", M: "10%" }}>
          <span
            style={{ textAlign: "right", display: "block", fontWeight: 700 }}
          >
              {FormatNumber(x.totalDiv)}
          </span>
        </View>
        <View width={{ base: "47%", M: "10%" }}>
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

// type ToggleDetailProps = {
//   isSelected: boolean;
//   showGrassDetail: (isShow: boolean) => void;
// };

// function ToggleDetail({ isSelected, showGrassDetail }: ToggleDetailProps) {
//   // let [isShow, setIsShow] = useState<boolean>(isSelected);

//   return (
//     <ToggleButton
//       flex
//       height={"auto"}
//       marginStart={"size-200"}
//       isEmphasized
//       isSelected={isSelected}
//       onChange={(e) => {
//         //        setIsShow(e);
//         showGrassDetail(e);
//       }}
//       isQuiet
//     >
//       <Pin aria-label="Pin" />
//       <Text>Details</Text>
//     </ToggleButton>
//   );
// }

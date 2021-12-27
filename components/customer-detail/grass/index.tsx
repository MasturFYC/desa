import dynamic from "next/dynamic";
import React, { Fragment, useEffect, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { ActionButton, Button } from "@react-spectrum/button";
import { Flex } from "@react-spectrum/layout";
import { Text } from "@react-spectrum/text";
import { env } from 'process';
import {
  dateParam,
  iCustomer,
  iGrass,
  iProduct,
} from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";
import Div from "@components/ui/Div";

const GrassDetail = dynamic(() => import("./grass-detail"), { ssr: false });
const GrassCost = dynamic(() => import("../../grass-cost/grass-cost"), { ssr: false });

const GrassForm = dynamic(() => import("./form"), {
  loading: () => <WaitMe />,
  ssr: false,
});

const initGrass: iGrass = {
  id: 0,
  customerId: 0,
  partnerId: 0,
  lunasId: 0,
  totalDiv: 0,
  subtotal: 0,
  orderDate: dateParam(null),
  descriptions: "Pembelian Rumput Laut",
  qty: 0,
  total: 0,
};

type GrassProps = {
  customerId: number;
};

export default function Grass(props: GrassProps) {
  let { customerId } = props;
  let [selectedGrassId, setSelectedGrassId] = useState<number>(-1);

  let grasses = useAsyncList<iGrass>({
    async load({ signal }) {
      let res = await fetch(`${env.apiKey}/customer/grass/${customerId}`, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iGrass) => item.id,
  });

  let customers = useAsyncList<iCustomer>({
    async load({ signal }) {
      let res = await fetch(env.apiKey + "/customer", {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iCustomer) => item.id,
  });

  let products = useAsyncList<iProduct>({
    async load({ signal }) {
      let res = await fetch(env.apiKey + "/category/2", {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iProduct) => item.id,
  });

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
          grasses.update(0, p);
          setSelectedGrassId(p.id);
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
      {grasses.isLoading ||
        (customers.isLoading && products.isLoading && <WaitMe />)}
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
          <View width="10%">
            <span style={{ textAlign: "right", display: "block" }}>
              JML HARGA
            </span>
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
                customers={customers}
                data={x}
                updateGrass={updateData}
                closeForm={closeForm}
              >
                <View>
                  <GrassDetail
                    grassId={x.id}
                    products={products}
                    updateTotal={(total, qty) => grasses.update(x.id, { ...x, total: x.total + total, qty: x.qty + qty })}
                  />
                  <View marginY={'size-200'}><strong>Biaya Operasional</strong></View>
                  <GrassCost grassId={x.id}
                    updateTotal={(total) => grasses.update(x.id, { ...x, total: x.total + total })}
                  />
                </View>
              </GrassForm>
            ) : (
              <div key={x.id} style={{ color: selectedGrassId >= 0  ? '#bbb' : 'inherit'}}>
              {renderPembelian({ x })}
              </div>
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
                {FormatNumber(grasses.items.reduce((a, b) => a + (b.total - b.totalDiv), 0))}
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
              <span style={{ fontWeight: 700, textAlign: "left", color: selectedGrassId >= 0  ? '#bbb' : 'inherit' }}>
                {x.id === 0 ? "Pembelian Baru" : x.descriptions}
              </span>
            </ActionButton>
          </View>
          {x.id > 0 && renderDetail(x)}
        </Flex>
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
        <View width={{ base: "47%", M: "10%" }}>
          <span
            style={{ textAlign: "right", display: "block", fontWeight: 700 }}
          >
            {FormatNumber(x.total)}
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
            {FormatNumber(x.total - x.totalDiv)}
          </span>
        </View>
      </>
    );
  }
};

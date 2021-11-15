import Head from "next/head";
import Link from "next/link";
import React, { FormEvent, Fragment, useEffect, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import { iUnit, iProduct } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Divider } from "@react-spectrum/divider";
import { ActionButton } from "@react-spectrum/button";
import { NextPage } from "next";
import UnitForm from "./form";
import { FormatNumber } from "@lib/format";
import WaitMe from "@components/ui/wait-me";

const initUnit: iUnit = {
  productId: 0,
  id: 0,
  name: "",
  content: 1.0,
  buyPrice: 0,
  margin: 0,
  price: 0.0
};

type UnitComponentProps = {
  productId: number,
  price: number,
  unit: string
}



const UnitComponent: NextPage<UnitComponentProps> = ({ productId, price, unit }) => {
  let [selectedId, setSelectedId] = React.useState<number>(-1);
  let [message, setMessage] = React.useState<string>("");
  let columnWidth = {base:"auto", M: "25%"} 

  let units = useAsyncList<iUnit>({
    async load({ signal }) {
      let res = await fetch(`/api/unit/list/${productId}`, { signal });
      let json = await res.json();
      return { items: [{...initUnit, productId: productId, price: price + (price * 30.0/100.0), margin: 30.0/100.0, buy_price: price, name: unit}, ...json] };
    },
    getKey: (item: iUnit) => item.id,
  })

  const deleteData = async (id: number) => {
    const url = `/api/unit/${id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iProduct | any = await res.json();

    if (res.status === 200) {
      units.remove(id);
    } else {
      console.log("Unit tidak dapat dihapus!");
      setMessage('Unit tidak dapat dihapus')
    }
  };

  const postUnit = (method: string, id: number, p: iUnit) => {
    if (method === "DELETE") {
      deleteData(id);
    } else {
      updateUnit(method, id, p);
    }
  };

  async function updateUnit(method: string, id: number, p: iUnit) {
    const url = `/api/unit/${id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: p }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      if (method === "POST") {
        units.insert(1, json);
      } else {
        units.update(id, json);
      }
      closeForm();
    } else {
      console.log(json.message)
      setMessage('Data unit tidak dapat diupdate, mungkin nama unit sama.')
    }
  }

  const closeForm = () => {
    setSelectedId(-1);
    setMessage('')
  };

  return (
    <Fragment>
      {units.isLoading && <WaitMe />}
      {units && units.items.map((x, i) => (
        <View key={x.id}>
          <Divider size="S" />
          <View
            borderColor={selectedId === x.id ? "green-500" : "transparent"}
            paddingStart={selectedId === x.id ? "size-50" : 0}
            borderStartWidth={"thickest"}
          >
            <Flex
              direction={"row" }
              columnGap="size-200"
            >
              <View flex width={"auto"}>
                <ActionButton
                  width={columnWidth}
                  isQuiet
                  onPress={() => {
                    setSelectedId(selectedId === x.id ? -1 : x.id);
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{x.id === 0 ? 'Unit Baru' : x.name}</span>
                </ActionButton>
              </View>
              {x.id > 0 && (
                <View width={columnWidth} paddingY={6}>
                  Isi: <strong>{FormatNumber(x.content)}</strong>
                </View>
              )}
              {x.id > 0 && (
                <View flex paddingY={6}>
                  Harga Jual: <strong>{FormatNumber(x.price)}</strong>
                </View>)}
            </Flex>
            {selectedId === x.id && (
              <Fragment>
                <View paddingX={{ base: 0, M: "size-1000" }}>
                  <UnitForm
                    price={price}
                    data={x}
                    updateUnit={postUnit}
                    closeForm={closeForm}
                  />
                  <View marginY={"size-250"}><span style={{ color: 'red' }}>{message}</span></View>
                </View>
              </Fragment>
            )}
          </View>
        </View>
      ))}
      <div style={{ marginBottom: '24px' }} />
    </Fragment>
  );
};

export default UnitComponent;

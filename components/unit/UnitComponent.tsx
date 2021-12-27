import React, {Fragment } from "react";
import { useAsyncList } from "@react-stately/data";
import { iUnit, iProduct } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Divider } from "@react-spectrum/divider";
import { ActionButton } from "@react-spectrum/button";
import { Text } from "@react-spectrum/text";
import { NextPage } from "next";
import { FormatNumber } from "@lib/format";
import WaitMe from "@components/ui/wait-me";
import PinAdd from "@spectrum-icons/workflow/Add";
import dynamic from "next/dynamic";
import { Checkbox } from "@react-spectrum/checkbox";


const UnitForm = dynamic(() => import("./form"), {
  ssr: false
})

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

const UnitComponent: NextPage<UnitComponentProps> = (props) => {
  let { productId, price, unit } = props;
  let [selectedId, setSelectedId] = React.useState<number>(-1);
  let [message, setMessage] = React.useState<string>("");
  let columnWidth = { base: "auto", M: "25%" }

  let units = useAsyncList<iUnit>({
    async load({ signal }) {
      let res = await fetch(`${process.env.apiKey}/unit/list/${productId}`, { signal });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iUnit) => item.id,
  })

  const deleteData = async (id: number) => {
    const url = `${process.env.apiKey}/unit/${id}`;
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
    const url = `${process.env.apiKey}/unit/${id}`;
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
        units.append(json);
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
      {units
        && [...units.items, { ...initUnit, productId: productId, price: price + (price * 30.0 / 100.0), margin: 30.0 / 100.0, buyPrice: price, name: unit }].map((x, i) => (
        <View key={x.id}>
          <Divider size="S" />
          <View
            borderColor={selectedId === x.id ? "green-500" : "transparent"}
            paddingStart={selectedId === x.id ? "size-50" : 0}
            borderStartWidth={"thickest"}
          >
            <Flex
              direction={"row"}
              columnGap="size-200"
            >
              <View flex width={"auto"} marginY={"size-75"}>
                <ActionButton
                  width={"auto"}
                  height={"auto"}
                  isQuiet
                  onPress={() => {
                    setSelectedId(selectedId === x.id ? -1 : x.id);
                  }}
                >{x.id === 0 
                  ?<><PinAdd size="S" height={"auto"} alignSelf={"center"} /><Text>Baru</Text></>
                  : <span style={{ fontWeight: 700, textAlign: "left" }}>{x.name}</span>}
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
                {x.id > 0 && (
                <View flex paddingY={6}>
                  <Checkbox isSelected={x.isDefault} onChange={(e)=> {
                    units.items.map(f => {
                      units.update(f.id, {...f, isDefault: x.id === f.id ? e : false})
                    })
                    updateUnits(x.productId, x.id)
                  }}>Set as default</Checkbox>
                </View>)}
            </Flex>
            {selectedId === x.id && (
                <View paddingX={{ base: 0, M: "size-1000" }}>
                  <UnitForm
                    price={price}
                    data={x}
                    updateUnit={postUnit}
                    closeForm={closeForm}
                  />
                  <View marginY={"size-250"}><span style={{ color: 'red' }}>{message}</span></View>
                </View>
            )}
          </View>
        </View>
      ))}
      <div style={{ marginBottom: '24px' }} />
    </Fragment>
  );

  async function updateUnits(prodId: number, unitId: number) {
    const url = `${process.env.apiKey}/unit/set-default/${prodId}/${unitId}`;
    const fetchOptions = {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      }
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      console.log('Set default unit success.')
    } else {
      console.log('Data unit tidak dapat diupdate, mungkin nama unit sama.')
    }    
  }
};

export default UnitComponent;
